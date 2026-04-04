import json
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import delete, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from config import setup_logging
from data import (
    AiRequest,
    AiResponse,
    AncestorNode,
    AncestorResponse,
    CanvasRead,
    Edge,
    Node,
    engine,
    get_async_session,
    init_db,
)
from data.queries.load_query import get_ancestors_recursive
from llm import PromptNodeModel, build_context

setup_logging()
logger = logging.getLogger("app.http")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Initializing database...")
    await init_db(reset=False)
    logger.info("✅ Database ready")

    app.state.ai_model = PromptNodeModel()

    yield

    await engine.dispose()


app: FastAPI = FastAPI(lifespan=lifespan)


app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_ai_model(request: Request) -> PromptNodeModel:
    return request.app.state.ai_model


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(
            "Unhandled exception on %s %s",
            request.method,
            request.url.path,
            exc_info=True,
        )
        return JSONResponse(status_code=500, content={"detail": f"{type(e).__name__}: {e}"})


# --- CANVAS DATA ---
@app.get("/canvas")
async def canvas(session: AsyncSession = Depends(get_async_session)) -> CanvasRead:
    nodes = await session.execute(select(Node))
    edges = await session.execute(select(Edge))
    return nodes, edges


@app.post("/canvas")
async def canvas_sync(data: CanvasRead, session: AsyncSession = Depends(get_async_session)) -> None:
    await session.execute(delete(Edge))
    await session.execute(delete(Node))

    if data.nodes:
        nodes = [
            n.model_dump(by_alias=True, exclude_unset=True, exclude_none=True) for n in data.nodes
        ]
        await session.execute(insert(Node), nodes)

    if data.edges:
        edges = [
            e.model_dump(by_alias=True, exclude_unset=True, exclude_none=True) for e in data.edges
        ]
        await session.execute(insert(Edge), edges)


# --- AI ---
@app.post("/llm/generate")
async def get_response(
    data: AiRequest,
    session: AsyncSession = Depends(get_async_session),
    ai_model: PromptNodeModel = Depends(get_ai_model),
) -> AiResponse:
    result = await session.execute(get_ancestors_recursive(data.target_id, data.source_handle))

    rows = []
    for row in result.mappings():
        r = dict(row)
        r["position"] = (
            json.loads(r["position"]) if isinstance(r["position"], str) else r["position"]
        )
        r["data"] = json.loads(r["data"]) if isinstance(r["data"], str) else r["data"]
        rows.append(r)

    nodes = [AncestorNode(**r) for r in rows]

    ancestor_response = AncestorResponse(
        node_id=data.target_id,
        source_handle=data.source_handle,
        total=len(nodes),
        ancestors=nodes,
    )
    context = build_context(ancestor_response)
    return await ai_model.generate(context, data.prompt)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

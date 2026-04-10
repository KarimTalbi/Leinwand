import json
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from config import setup_logging
from core import CanvasService, get_canvas_service, build_context
from data import (
    AiRequest,
    AiResponse,
    AncestorNode,
    AncestorResponse,
    CanvasRead,
    MergeRequest,
    engine,
    get_async_session,
    init_db,
)
from data.queries.load_query import get_ancestors_recursive
from data.schemas import MergeResponse
from llm import PromptNodeModel, build_context_sectioned

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
        return JSONResponse(
            status_code=500, content={"detail": f"{type(e).__name__}: {e}"}
        )


# --- CANVAS DATA ---


@app.get("/canvas")
async def canvas(
    service: CanvasService = Depends(get_canvas_service),
) -> CanvasRead:
    return await service.list()


@app.post("/canvas")
async def canvas_sync(
    data: CanvasRead, service: CanvasService = Depends(get_canvas_service)
) -> None:
    await service.sync(data)


# --- AI ---
@app.post("/llm/generate")
async def get_response(
    data: AiRequest,
    service: CanvasService = Depends(get_canvas_service),
    ai_model: PromptNodeModel = Depends(get_ai_model),
) -> AiResponse:
    context = await build_context(service, [data.target_id])
    return await ai_model.generate(context, data.prompt)


@app.post("/llm/merge")
async def merge_streams(
    data: MergeRequest, session: AsyncSession = Depends(get_async_session)
) -> MergeResponse:
    contexts = []

    for handle in ["target-1", "target-2"]:
        result = await session.execute(get_ancestors_recursive(data.target_id, handle))

        rows = []
        for row in result.mappings():
            r = dict(row)
            r["position"] = (
                json.loads(r["position"])
                if isinstance(r["position"], str)
                else r["position"]
            )
            r["data"] = (
                json.loads(r["data"]) if isinstance(r["data"], str) else r["data"]
            )
            rows.append(r)

        nodes = [AncestorNode(**r) for r in rows]

        ancestor_response = AncestorResponse(
            node_id=data.target_id,
            target_handle=handle,
            total=len(nodes),
            ancestors=nodes,
        )
        contexts.append(ancestor_response)

    context = build_context_sectioned(contexts)
    return MergeResponse(data=context)


@app.post("/llm/merge/resolve")
async def resolve_conflicts(
    data: MergeRequest, session: AsyncSession = Depends(get_async_session)
):
    logger.info(data)
    return {
        "context": "Context for the merge prompt.",
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

import json
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import delete, select, desc
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
    MergeRequest,
    Node,
    engine,
    get_async_session,
    init_db,
    NodeRead,
    EdgeRead,
    History,
)
from data.queries.load_query import get_ancestors_recursive
from data.schemas import MergeResponse
from llm import PromptNodeModel, build_context, build_context_sectioned

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
async def canvas(session: AsyncSession = Depends(get_async_session)) -> CanvasRead:

    logger.info("Loading canvas data...")

    nodes = await session.execute(select(Node))
    edges = await session.execute(select(Edge))

    logger.info("Canvas data loaded successfully.")

    return {"nodes": list(nodes.scalars().all()), "edges": list(edges.scalars().all())}


@app.post("/canvas")
async def canvas_sync(
    data: CanvasRead, session: AsyncSession = Depends(get_async_session)
) -> None:

    db_nodes = await session.execute(select(Node))
    db_edges = await session.execute(select(Edge))

    db_nodes_all = db_nodes.scalars().all()
    db_edges_all = db_edges.scalars().all()

    logger.info(db_nodes_all)

    nodes_read = [NodeRead.model_validate(n) for n in db_nodes_all]
    edges_read = [EdgeRead.model_validate(e) for e in db_edges_all]

    logger.info(nodes_read)

    dump_nodes = [
        n.model_dump(exclude_unset=True, exclude_none=True) for n in nodes_read
    ]
    dump_edges = [
        e.model_dump(exclude_unset=True, exclude_none=True) for e in edges_read
    ]

    history = {"nodes": dump_nodes, "edges": dump_edges}

    db_history = History(data=history)

    session.add(db_history)
    await session.flush()

    node_ids = [n.id for n in data.nodes]
    edge_ids = [e.id for e in data.edges]

    await session.execute(delete(Edge).where(Edge.id.notin_(edge_ids)))
    await session.execute(delete(Node).where(Node.id.notin_(node_ids)))

    if data.nodes:
        await session.execute(
            insert(Node)
            .values(
                [
                    n.model_dump(exclude_unset=True, exclude_none=True)
                    for n in data.nodes
                ]
            )
            .on_conflict_do_update(
                index_elements=["id"],
                set_={
                    "type": insert(Node).excluded.type,
                    "position": insert(Node).excluded.position,
                    "data": insert(Node).excluded.data,
                },
            )
        )

    if data.edges:
        await session.execute(
            insert(Edge)
            .values(
                [
                    e.model_dump(exclude_unset=True, exclude_none=True)
                    for e in data.edges
                ]
            )
            .on_conflict_do_update(
                index_elements=["id"],
                set_={
                    "source": insert(Edge).excluded.source,
                    "target": insert(Edge).excluded.target,
                    "source_handle": insert(Edge).excluded.source_handle,
                    "target_handle": insert(Edge).excluded.target_handle,
                },
            )
        )

    logger.info("Canvas data synced successfully.")


# --- AI ---
@app.post("/llm/generate")
async def get_response(
    data: AiRequest,
    session: AsyncSession = Depends(get_async_session),
    ai_model: PromptNodeModel = Depends(get_ai_model),
) -> AiResponse:

    logger.info("Generating response...")

    result = await session.execute(
        get_ancestors_recursive(data.target_id, data.source_handle)
    )

    rows = []
    for row in result.mappings():
        r = dict(row)
        r["position"] = (
            json.loads(r["position"])
            if isinstance(r["position"], str)
            else r["position"]
        )
        r["data"] = json.loads(r["data"]) if isinstance(r["data"], str) else r["data"]
        rows.append(r)

    nodes = [AncestorNode(**r) for r in rows]

    ancestor_response = AncestorResponse(
        node_id=data.target_id,
        target_handle=data.source_handle,
        total=len(nodes),
        ancestors=nodes,
    )
    context = build_context(ancestor_response)

    logger.info("Response generated successfully.")
    logger.info(f"Context: {context}")
    logger.info(f"Prompt: {data.prompt}")

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


@app.get("/canvas/revert")
async def revert_canvas(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(
        select(History).order_by(desc(History.timestamp)).limit(1)
    )

    newest = result.scalar_one_or_none()

    data = dict(newest)["data"]

    h_nodes = json.loads(data["nodes"])
    h_edges = json.loads(data["edges"])

    logger.info(h_nodes)

    db_nodes = [Node(**n) for n in h_nodes]
    db_edges = [Edge(**e) for e in h_edges]

    await session.execute(delete(Node))
    await session.execute(delete(Edge))

    await session.execute(insert(Node).values(db_nodes))
    await session.execute(insert(Edge).values(db_edges))

    nodes = await session.execute(select(Node))
    edges = await session.execute(select(Edge))

    logger.info("Canvas data loaded successfully.")

    return {"nodes": list(nodes.scalars().all()), "edges": list(edges.scalars().all())}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

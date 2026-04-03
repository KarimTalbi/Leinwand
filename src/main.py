import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import setup_logging
from core import (
    get_canvas_service,
    get_node_service,
    load_canvas,
    sync_canvas,
    generate_response,
)
from data import (
    NodeService,
    engine,
    init_db,
    CanvasRead,
    Confirmation,
    EdgeService,
    AiResponse,
    AiRequest,
)
from llm import PromptNodeModel

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


@app.get("/")
async def root():
    return {"message": "API is online"}


# --- CANVAS DATA ---
@app.get("/canvas")
async def canvas(
    service: tuple[NodeService, EdgeService] = Depends(get_canvas_service),
) -> CanvasRead:
    node_service, edge_service = service
    return await load_canvas(node_service, edge_service)


@app.post("/canvas")
async def canvas_sync(
    data: CanvasRead,
    service: tuple[NodeService, EdgeService] = Depends(get_canvas_service),
) -> Confirmation:
    node_service, edge_service = service
    return await sync_canvas(data, node_service, edge_service)


# --- AI ---
@app.post("/llm")
async def get_response(
    data: AiRequest,
    ai_model: PromptNodeModel = Depends(get_ai_model),
    service: NodeService = Depends(get_node_service),
) -> AiResponse:
    return await generate_response(data, ai_model, service)


# --- TEST ---
@app.get("/test")
async def test(): ...


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

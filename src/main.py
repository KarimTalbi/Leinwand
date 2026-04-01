import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core import get_canvas_service
from core.dependencies import get_node_service, get_prompt_service
from data import CanvasRead, CanvasService, NodeService, engine, init_db
from data.schemas import CanvasCreate, ConfRes
from llm import AiResponse, Prompt, PromptRequest, PromptService, build_context
from utils import service_monitor

logging.basicConfig(level=logging.INFO)
logging.getLogger("app").setLevel(logging.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Initializing database...")
    await init_db(reset=False)
    print("✅ Database ready")

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


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        print(e)
        return JSONResponse(status_code=500, content={"detail": f"{type(e).__name__}: {e}"})


@service_monitor
@app.get("/")
async def root():
    return {"message": "API is online"}


# --- CANVAS DATA ---
@service_monitor
@app.get("/canvas")
async def canvas(service: CanvasService = Depends(get_canvas_service)) -> CanvasRead:
    return await service.load()


@service_monitor
@app.post("/canvas")
async def canvas_save(
    data: CanvasCreate, service: CanvasService = Depends(get_canvas_service)
) -> ConfRes:
    return await service.sync(data)


# --- AI ---
@service_monitor
@app.post("/llm")
async def generate_response(
    data: PromptRequest,
    prompt_service: PromptService = Depends(get_prompt_service),
    service: NodeService = Depends(get_node_service),
) -> AiResponse:
    ancestors = await service.ancestors(data.target_id)
    context = build_context(ancestors)
    return await prompt_service.generate_graph_response(context, data.prompt)


@service_monitor
@app.get("/test")
async def test(service: NodeService = Depends(get_node_service)):
    first = await service.ancestors("498da0f37f654a4b852f98b418dc5977", target_handle="target-1")
    second = await service.ancestors("498da0f37f654a4b852f98b418dc5977", target_handle="target-2")
    print(first, "\n", second, "\n")
    return


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

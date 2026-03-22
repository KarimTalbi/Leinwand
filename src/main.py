import logging
from contextlib import asynccontextmanager
from uuid import UUID

import uvicorn
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core import get_canvas_service
from core.context import Context
from core.dependencies import get_ai_model, get_context
from data import CanvasRead, CanvasService, engine, init_db
from data.schemas import CanvasCreate, ConfRes
from llm import AiModelBase, AiResponse, PromptRequest, PromptService

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
        return JSONResponse(
            status_code=500, content={"detail": f"{type(e).__name__}: {e}"}
        )


@app.get("/")
async def root():
    return {"message": "API is online"}


# --- CANVAS DATA ---
@app.get("/canvas")
async def canvas(service: CanvasService = Depends(get_canvas_service)) -> CanvasRead:
    result = await service.load()
    return result


@app.post("/canvas")
async def canvas_save(
    data: CanvasCreate, service: CanvasService = Depends(get_canvas_service)
) -> ConfRes:
    print(data)
    return await service.sync(data)


# --- AI ---
@app.post("/llm")
async def generate_response(
        data: PromptRequest
) -> AiResponse:
    print(data.target_id, data.prompt)
    return AiResponse(label="test Node", response="### test\ntest")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

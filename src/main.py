import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from data import engine
from llm import PromptNodeModel
from routes import user_router, canvas_router, edge_router, node_router
from utils import setup_logging

setup_logging()
logger = logging.getLogger("app.http")


@asynccontextmanager
async def lifespan(app: FastAPI):

    app.state.ai_model = PromptNodeModel()

    yield

    await engine.dispose()


# FastAPI app setup
app: FastAPI = FastAPI(lifespan=lifespan)

app.include_router(user_router)
app.include_router(canvas_router)
app.include_router(node_router)
app.include_router(edge_router)


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
        logger.error(
            "Unhandled exception on %s %s",
            request.method,
            request.url.path,
            exc_info=True,
        )
        return JSONResponse(
            status_code=500, content={"detail": f"{type(e).__name__}: {e}"}
        )


# PYTHONPATH=src fastapi dev src/main.py
# docker compose up -d
# .venv/bin/alembic revision --autogenerate -m "initial schema"
# .venv/bin/alembic upgrade head

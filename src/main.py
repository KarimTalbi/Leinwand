import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data import engine
from exceptions import register_exception_handlers
from llm import PromptNodeModel
from routes import user_router, canvas_router, edge_router, node_router
from utils import setup_logging

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.ai_model = PromptNodeModel()
    yield
    await engine.dispose()


# FastAPI app setup
app: FastAPI = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


register_exception_handlers(app)

app.include_router(user_router)
app.include_router(canvas_router)
app.include_router(node_router)
app.include_router(edge_router)


# PYTHONPATH=src fastapi dev src/main.py
# docker compose up -d
# .venv/bin/alembic revision --autogenerate -m "initial schema"
# .venv/bin/alembic upgrade head

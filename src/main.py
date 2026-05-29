import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from logging import Logger

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data import Base, engine
from exceptions import register_exception_handlers
from routes import canvas_router, node_router, user_router, llm_router, api_key_router
from utils import setup_logging

DROP_AND_CREATE_DB = False

setup_logging()
logger: Logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None]:
    async with engine.begin() as conn:
        if DROP_AND_CREATE_DB:
            logger.info("Dropping and recreating database")
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
    yield

    await engine.dispose()


# FastAPI app setup
app: FastAPI = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://192.168.0.207:5173",
        "http://192.168.0.106:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


register_exception_handlers(app)

app.include_router(user_router)
app.include_router(canvas_router)
app.include_router(node_router)
app.include_router(llm_router)
app.include_router(api_key_router)

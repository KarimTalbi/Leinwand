import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.data.db_models import Base

load_dotenv()

USER_DATA_PATH = os.getenv("USER_DATA_PATH", "./data")
DB_PATH = Path(USER_DATA_PATH) / "db.sqlite"

DB_PATH.parent.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH.absolute()}"


engine: AsyncEngine = create_async_engine(
    DATABASE_URL, echo=True, connect_args={"check_same_thread": False, "timeout": 30}
)
# pool_pre_ping=True
# pool_recycle=3600
# pool_size=5
# max_overflow=10


async_session: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Provides an asynchronous SQLAlchemy session generator.

    Yields:
        AsyncSession: An asynchronous database session.
    """
    async with async_session() as session:
        async with session.begin():
            yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.execute(text("PRAGMA foreign_keys=ON"))
        await conn.run_sync(Base.metadata.create_all)


get_session_ctx = asynccontextmanager(get_async_session)

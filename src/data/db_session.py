import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from src.data.db_models import Base

USER_DATA_PATH = os.getenv("USER_DATA_PATH", "./data")
DB_PATH = Path(USER_DATA_PATH) / "db.sqlite"

DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH.absolute()}"


engine: AsyncEngine = create_async_engine(
    DATABASE_URL, echo=False, connect_args={"check_same_thread": False, "timeout": 30}
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
    Creates and manages an asynchronous session generator for database interactions.

    This method provides an `AsyncSession` instance that is created using the
    `async_session` factory. It ensures that the session is properly initialized
    and closed after usage, adhering to proper session management practices in an
    asynchronous context.

    Yields:
        AsyncGenerator[AsyncSession, None]: An asynchronous generator that provides
        an active database session for performing operations.

    """
    async with async_session() as session:
        async with session.begin():
            yield session


async def init_db(reset: bool = False):
    """
    Initialize the database and optionally reset its schema.

    This function establishes a connection with the database using an asynchronous
    engine. If the reset parameter is set to True, it will drop all existing
    database tables before recreating them. Otherwise, it simply ensures that the
    database schema exists and is created.

    Args:
        reset (bool): If True, the database tables will be dropped before being
            recreated. Defaults to False.
    """
    async with engine.begin() as conn:
        if reset:
            await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


get_session_ctx = asynccontextmanager(get_async_session)

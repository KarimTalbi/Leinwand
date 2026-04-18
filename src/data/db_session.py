from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

DATABASE_URL = "postgresql+psycopg://dev:dev@localhost:5432/canvas_db"


engine: AsyncEngine = create_async_engine(DATABASE_URL, echo=False)


async_session: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:

    async with async_session() as session:
        async with session.begin():
            yield session


get_session_ctx = asynccontextmanager(get_async_session)

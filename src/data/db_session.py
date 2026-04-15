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

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "db.sqlite"

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

    async with async_session() as session:
        async with session.begin():
            yield session


async def init_db(reset: bool = False):

    async with engine.begin() as conn:
        if reset:
            await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


get_session_ctx = asynccontextmanager(get_async_session)

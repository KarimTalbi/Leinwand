import os
import ssl
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

ssl_context: ssl.SSLContext = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

load_dotenv()

USER: str | None = os.getenv("DB_USER")
NAME: str | None = os.getenv("DB_NAME")
PASS: str | None = os.getenv("DB_PASS")
HOST: str | None = os.getenv("DB_HOST")
PORT: str | None = os.getenv("DB_PORT")


DATABASE_URL: str = f"postgresql+asyncpg://{USER}:{PASS}@{HOST}:{PORT}/{NAME}"
engine: AsyncEngine = create_async_engine(
    DATABASE_URL, echo=True, connect_args={"ssl": ssl_context}
)

async_session: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        async with session.begin():
            yield session


get_session_ctx = asynccontextmanager(get_async_session)

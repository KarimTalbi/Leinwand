"""
This module sets up the asynchronous SQLAlchemy database session.

It handles:
- Loading environment variables for database configuration.
- Constructing the database connection URL.
- Creating the asynchronous SQLAlchemy engine.
- Configuring the asynchronous session maker.
- Providing a dependency for generating asynchronous database sessions.
"""
import os
from collections.abc import AsyncGenerator

import dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
    AsyncEngine,
)

dotenv.load_dotenv()

USER: str | None = os.getenv("DB_USER")
PASS: str | None = os.getenv("DB_PASSWORD")
HOST: str | None = os.getenv("DB_HOST")
PORT: str | None = os.getenv("DB_PORT")
NAME: str | None = os.getenv("DB_NAME")

PATH: str = f"postgresql+psycopg://{USER}:{PASS}@{HOST}:{PORT}/{NAME}"

engine: AsyncEngine = create_async_engine(PATH, echo=False)
async_session: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession]:
    """
    Yields an asynchronous database session.

    This function is intended to be used as a FastAPI dependency. It creates a
    new database session, begins a transaction, and yields the session. The
    transaction is automatically committed if no exceptions occur, or rolled
    back if an exception is raised during the request lifecycle.

    Yields:
        AsyncSession: An active SQLAlchemy asynchronous database session.
    """
    async with async_session() as session, session.begin():
        yield session

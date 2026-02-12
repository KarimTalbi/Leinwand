"""
This module provides database configuration and utilities for interacting with
an asynchronous PostgreSQL database using SQLAlchemy. It includes secure
connection handling with SSL, and an async session factory for database
operations.

Classes and functions are tailored for asynchronous database access, which
enables more efficient handling of I/O-bound operations in an event-driven
application.
"""
import os
import ssl
from dotenv import load_dotenv

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

load_dotenv()

USER = os.getenv("DB_USER")
NAME = os.getenv("DB_NAME")
PASS = os.getenv("DB_PASS")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")

DATABASE_URL = f"postgresql+asyncpg://{USER}:{PASS}@{HOST}:{PORT}/{NAME}"
engine = create_async_engine(
    DATABASE_URL, echo=True, connect_args={"ssl": ssl_context}
)

# noinspection PyTypeChecker
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_async_session():
    """
    Creates an asynchronous database session for interacting with the database.

    This function provides an asynchronous database session that can be used
    to perform database operations. It uses an asynchronous context manager to
    ensure that the session is properly closed once the operations are completed.

    Yields:
        AsyncSession: The active asynchronous database session.
    """
    async with async_session() as session:
        yield session

import os
from collections.abc import AsyncGenerator

import dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

dotenv.load_dotenv()

USER = os.getenv("DB_USER")
PASS = os.getenv("DB_PASSWORD")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")
NAME = os.getenv("DB_NAME")

PATH = f"postgresql+psycopg://{USER}:{PASS}@{HOST}:{PORT}/{NAME}"

engine = create_async_engine(PATH, echo=False)
async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession]:
    async with async_session() as session, session.begin():
        yield session

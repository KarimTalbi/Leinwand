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
engine = create_async_engine(DATABASE_URL, echo=True, connect_args={"ssl": ssl_context})

# noinspection PyTypeChecker
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_async_session():
    async with async_session() as session:
        yield session

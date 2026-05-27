from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select

from data import ApiKeyRead
from data.db_models import ApiKey


async def add_key(session: AsyncSession, key: ApiKeyRead, user_id: str) -> None:
    new_key = ApiKey(**key.model_dump(), user_id=user_id)
    session.add(new_key)


async def list_keys(session: AsyncSession, user_id: str) -> list[ApiKey]:
    result = await session.execute(select(ApiKey).where(ApiKey.user_id == user_id))
    return list(result.scalars().all())


async def delete_key(session: AsyncSession, user_id: str, api_key_id: str) -> None:
    return await session.execute(delete(ApiKey).where(ApiKey.user_id == user_id).where(ApiKey.id == api_key_id))

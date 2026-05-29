from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select

from data import ApiKeyRead
from data.db_models import ApiKey
from exceptions import InvalidApiKeyException


async def add_key(session: AsyncSession, key: ApiKeyRead, user_id: str) -> None:
    new_key = ApiKey(**key.model_dump(), user_id=user_id)
    session.add(new_key)
    await session.flush()


async def list_keys(session: AsyncSession, user_id: str) -> list[ApiKey]:
    result = await session.execute(select(ApiKey).where(ApiKey.user_id == user_id))
    return list(result.scalars().all())


async def delete_key(session: AsyncSession, api_key_id: str) -> None:
    key = await session.get(ApiKey, api_key_id)

    if not key:
        raise InvalidApiKeyException

    await session.delete(key)
    await session.flush()

async def get_key(session: AsyncSession, api_key_id: str, user_id: str) -> str:
    result = await session.execute(select(ApiKey).where(ApiKey.id == api_key_id).where(ApiKey.user_id == user_id))
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise InvalidApiKeyException

    return api_key.key


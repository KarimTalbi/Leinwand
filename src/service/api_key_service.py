from typing import Any

from data import LLMModelConfig
from data import NodeRead
from sqlalchemy import Result
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
    result: Result[tuple[ApiKey]] = await session.execute(
        select(ApiKey).where(ApiKey.user_id == user_id)
    )
    return list(result.scalars().all())


async def delete_key(session: AsyncSession, api_key_id: str) -> None:
    key: ApiKey | None = await session.get(ApiKey, api_key_id)

    if key is None:
        raise InvalidApiKeyException

    await session.delete(key)
    await session.flush()


async def get_key(session: AsyncSession, api_key_id: str, user_id: str) -> str:
    result: Result[tuple[ApiKey]] = await session.execute(
        select(ApiKey).where(ApiKey.id == api_key_id).where(ApiKey.user_id == user_id)
    )
    api_key: ApiKey | None = result.scalar_one_or_none()

    if not api_key:
        raise InvalidApiKeyException

    return api_key.key


async def get_llm_model_config(session, node: NodeRead, user_id: str) -> LLMModelConfig:
    model_config: dict[str, Any] | None = node.data.get("model")

    if model_config is None:
        raise InvalidApiKeyException

    user_model: str | None = model_config.get("model")
    user_provider: str | None = model_config.get("modelProvider")
    user_key_id: str | None = model_config.get("key_id")

    if not (user_model and user_provider and user_key_id):
        raise InvalidApiKeyException

    api_key: str = await get_key(session, user_key_id, user_id)

    return LLMModelConfig(model=user_model, model_provider=user_provider, api_key=api_key)

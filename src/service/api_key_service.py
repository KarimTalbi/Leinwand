"""
This module provides services for managing and retrieving API keys.

It interacts with the database to:
- Add new API keys.
- List existing API keys for a user.
- Delete specific API keys.
- Retrieve the actual key string for a given key ID.
- Extract and construct LLM configuration objects from node data,
  including looking up the necessary API key.
"""
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
    """
    Adds a new API key to the database for a specific user.

    Args:
        session: The asynchronous database session.
        key: The API key data to be added.
        user_id: The ID of the user owning the key.
    """
    new_key = ApiKey(**key.model_dump(), user_id=user_id)
    session.add(new_key)
    await session.flush()


async def list_keys(session: AsyncSession, user_id: str) -> list[ApiKey]:
    """
    Retrieves all API keys associated with a specific user.

    Args:
        session: The asynchronous database session.
        user_id: The ID of the user.

    Returns:
        A list of ApiKey objects.
    """
    result: Result[tuple[ApiKey]] = await session.execute(
        select(ApiKey).where(ApiKey.user_id == user_id)
    )
    return list(result.scalars().all())


async def delete_key(session: AsyncSession, api_key_id: str) -> None:
    """
    Deletes a specific API key from the database.

    Args:
        session: The asynchronous database session.
        api_key_id: The ID of the API key to delete.

    Raises:
        InvalidApiKeyException: If the API key is not found.
    """
    key: ApiKey | None = await session.get(ApiKey, api_key_id)

    if key is None:
        raise InvalidApiKeyException

    await session.delete(key)
    await session.flush()


async def get_key(session: AsyncSession, api_key_id: str, user_id: str) -> str:
    """
    Retrieves the actual API key string for a given key ID and user.

    Args:
        session: The asynchronous database session.
        api_key_id: The ID of the API key to retrieve.
        user_id: The ID of the user who owns the key.

    Returns:
        The API key string.

    Raises:
        InvalidApiKeyException: If the API key is not found or does not belong to the user.
    """
    result: Result[tuple[ApiKey]] = await session.execute(
        select(ApiKey).where(ApiKey.id == api_key_id).where(ApiKey.user_id == user_id)
    )
    api_key: ApiKey | None = result.scalar_one_or_none()

    if not api_key:
        raise InvalidApiKeyException

    return api_key.key


async def get_llm_model_config(session, node: NodeRead, user_id: str) -> LLMModelConfig:
    """
    Constructs an LLMModelConfig object from node data.

    This function extracts model configuration details (model name, provider,
    and key ID) from the provided node's data. It then retrieves the actual
    API key using the extracted key ID and the user's ID.

    Args:
        session: The asynchronous database session.
        node: The node containing the model configuration data.
        user_id: The ID of the user requesting the configuration.

    Returns:
        An LLMModelConfig object ready to be used for LLM initialization.

    Raises:
        InvalidApiKeyException: If the configuration is missing or invalid, or if the key cannot be retrieved.
    """
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

"""
This module defines the API routes for managing user API keys.

It provides endpoints for:
- Listing all API keys associated with the authenticated user.
- Adding a new API key, verifying its validity, and detecting available models.
- Deleting an existing API key.

The routes handle authentication, database session management, and validation
using dependencies and custom exceptions.
"""
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import ApiKeyRead, ApiKeyReturn, UserAuth, get_async_session
from data.db_models import ApiKey
from data.llm_key_validator import ModelType, Provider, create_validator, detect_provider
from data.llm_key_validator.base import LLMKeyValidator
from exceptions import InvalidApiKeyException
from service import api_key_service as aks
from service import get_current_active_user
from utils import encrypt_key

api_key_router = APIRouter(prefix="/api_key", tags=["api_key"])


@api_key_router.get("/list/", response_model=list[ApiKeyReturn])
async def list_api_keys(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    """
    Retrieves a list of all API keys for the current authenticated user.

    Args:
        current_user: The authenticated user making the request.
        session: The database session.

    Returns:
        A list of ApiKeyReturn objects representing the user's API keys.
    """
    result: list[ApiKey] = await aks.list_keys(session, current_user.id)
    return result


@api_key_router.post("/create/")
async def create_api_key(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    data: ApiKeyRead,
    session: AsyncSession = Depends(get_async_session),
) -> None:
    """
    Creates a new API key entry for the current user.

    This endpoint verifies the provided API key by detecting its provider and
    attempting to fetch available chat models. If successful, it encrypts the
    key and stores it in the database along with the provider and available models.

    Args:
        current_user: The authenticated user making the request.
        data: The API key data payload from the request.
        session: The database session.

    Raises:
        InvalidApiKeyException: If the key cannot be validated or no chat models are found.
    """
    provider: Provider = detect_provider(data.key)
    validator: LLMKeyValidator = create_validator(provider, data.key)
    chat_models: list[str] = await validator.get_models_by_type(ModelType.CHAT)

    if not chat_models:
        raise InvalidApiKeyException

    data.model_provider = provider
    data.models = chat_models
    data.key = encrypt_key(data.key)

    await aks.add_key(session, data, current_user.id)


@api_key_router.delete("/delete/{api_key_id}/")
async def delete_api_key(
    _: Annotated[UserAuth, Depends(get_current_active_user)],
    api_key_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> None:
    """
    Deletes an existing API key entry.

    Args:
        _: The authenticated user making the request (unused variable).
        api_key_id: The unique identifier of the API key to delete.
        session: The database session.
    """
    await aks.delete_key(session, api_key_id)

from data.llm_key_validator import Provider
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from data import ApiKeyRead, UserAuth, get_async_session, ApiKeyReturn
from data.llm_key_validator.base import LLMKeyValidator
from exceptions import InvalidApiKeyException
from service import get_current_active_user, api_key_service as aks
from data.llm_key_validator import detect_provider, create_validator, ModelType
from utils import encrypt_key

api_key_router = APIRouter(prefix="/api_key", tags=["api_key"])

class ApiKeyDelete(BaseModel):
    key_id: str

@api_key_router.get("/list/", response_model=list[ApiKeyReturn])
async def list_api_keys(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    session: AsyncSession = Depends(get_async_session)
):
    result = await aks.list_keys(session, current_user.id)
    return result


@api_key_router.post("/create/")
async def create_api_key(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    data: ApiKeyRead,
    session: AsyncSession = Depends(get_async_session)
) -> None:
    provider: Provider | None = detect_provider(data.key)

    if not provider:
        raise InvalidApiKeyException

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
    session: AsyncSession = Depends(get_async_session)
) -> None:
    await aks.delete_key(session, api_key_id)
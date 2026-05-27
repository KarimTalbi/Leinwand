from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import ApiKeyRead, UserAuth, get_async_session
from service import get_current_active_user, api_key_service as aks

api_key_router = APIRouter(prefix="/api_key", tags=["api_key"])


@api_key_router.get("/list/", response_model=ApiKeyRead)
async def list_api_keys(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    session: AsyncSession = Depends(get_async_session)
):
    return await aks.list_keys(session, current_user.id)


@api_key_router.post("/create/")
async def create_api_key(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    data: ApiKeyRead,
        session: AsyncSession = Depends(get_async_session)
):
    await aks.add_key(session, data, current_user.id)


@api_key_router.delete("/delete/{api_key_id}/")
async def delete_api_key(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    api_key_id: str,
    session: AsyncSession = Depends(get_async_session)
):
    await aks.delete_key(session, api_key_id, current_user.id)
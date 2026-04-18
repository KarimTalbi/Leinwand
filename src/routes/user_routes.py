from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from data import Token, UserAuth, UserRead, UserCreate, get_async_session
from service.user_service import get_current_active_user, create_user, get_access_token

user_router = APIRouter(prefix="/users", tags=["users"])


@user_router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: AsyncSession = Depends(get_async_session),
) -> Token:
    return await get_access_token(session, form_data.username, form_data.password)


@user_router.get("/me")
async def read_users_me(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
) -> UserRead:
    return current_user


@user_router.post("/create")
async def create_users(
    user: UserCreate, session: AsyncSession = Depends(get_async_session)
) -> UserRead:
    return await create_user(session, user)

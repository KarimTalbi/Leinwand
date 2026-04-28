from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from data import Token, UserAuth, UserCreate, UserRead, get_async_session
from service.user_service import create_user, get_access_token, get_current_active_user

user_router = APIRouter(prefix='/users', tags=['users'])


@user_router.post('/token', response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await get_access_token(session, form_data.username, form_data.password)


@user_router.get('/me', response_model=UserRead)
async def read_users_me(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
) -> Any:
    return current_user


@user_router.post('/create', response_model=UserRead)
async def create_users(user: UserCreate, session: AsyncSession = Depends(get_async_session)) -> Any:
    return await create_user(session, user)

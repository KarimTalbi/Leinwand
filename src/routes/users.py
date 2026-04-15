import os
from datetime import timedelta
from typing import Annotated

import dotenv
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from authentification import (
    Token,
    authenticate_user,
    create_access_token,
    UserBase,
    get_current_active_user,
    get_password_hash,
    UserCreate,
    UserRead,
)
from core import get_user_service, UserService
from utils import InvalidUserOrPassword, UserAlreadyExists

dotenv.load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

user_router = APIRouter(prefix="/users", tags=["users"])


@user_router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: UserService = Depends(get_user_service),
) -> Token:

    user = await service.get_user(username=form_data.username)

    if not user or not authenticate_user(user, form_data.password):
        raise InvalidUserOrPassword

    access_token_expires = timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))

    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")


@user_router.get("/me")
async def read_users_me(
    current_user: Annotated[UserBase, Depends(get_current_active_user)],
) -> UserRead:
    return current_user


@user_router.post("/create")
async def create_user(
    user: UserCreate, service: UserService = Depends(get_user_service)
):

    is_username_taken = await service.is_user(user.username)

    if is_username_taken:
        raise UserAlreadyExists

    hashed_password = get_password_hash(user.password)

    user = await service.create_user(user.username, hashed_password)

    return user

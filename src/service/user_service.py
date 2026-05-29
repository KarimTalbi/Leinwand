from sqlalchemy.orm.attributes import flag_modified
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

import dotenv
import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession

from data import Token, TokenData, User, UserCreate, get_async_session, UserData
from exceptions import (
    CredentialsException,
    InactiveUserException,
    InvalidUserOrPasswordException,
    UserAlreadyExistsException,
    UserNotFoundException,
)

dotenv.load_dotenv()

password_hash: PasswordHash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")

DUMMY_HASH: str = os.getenv("AUTH_DUMMY_HASH", "")
SECRET_KEY: str = os.getenv("AUTH_SECRET_KEY", "")
ALGORITHM: str = os.getenv("AUTH_ALGORITHM", "")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("AUTH_ACCESS_TOKEN_EXPIRE_MINUTES", 0))


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


async def get_user(session: AsyncSession, username: str) -> User | None:
    result: Result[tuple[User]] = await session.execute(
        select(User).where(User.username == username)
    )

    return result.scalar_one_or_none()


async def update_user(session: AsyncSession, data: UserData, user_id: str) -> None:
    user: User | None = await session.get(User, user_id)

    if user is None:
        raise UserNotFoundException

    user_data: dict = user.user_data or {}

    for key, value in data.model_dump().items():
        user_data[key] = value

    user.user_data = user_data

    flag_modified(user, "user_data")
    await session.flush()


async def authenticate_user(session: AsyncSession, username: str, password: str) -> User:
    user: User | None = await get_user(session, username)

    if user is None:
        verify_password(password, DUMMY_HASH)
        raise InvalidUserOrPasswordException

    if not verify_password(password, user.hashed_password):
        raise InvalidUserOrPasswordException

    return user


async def create_user(session: AsyncSession, user: UserCreate) -> User:
    is_user_taken: User | None = await get_user(session, user.username)

    if is_user_taken:
        raise UserAlreadyExistsException

    hashed_password: str = get_password_hash(user.password)
    new_user = User(id=user.id, username=user.username, hashed_password=hashed_password)

    session.add(new_user)

    await session.flush()
    await session.refresh(new_user)

    return new_user


def create_access_token(data: dict[str, str], expires_delta: timedelta | None = None) -> str:
    to_encode: dict[str, str] = data.copy()

    if expires_delta:
        expire: datetime = datetime.now(timezone.utc) + expires_delta

    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    # pyrefly: ignore [no-matching-overload]
    to_encode.update({"exp": expire})
    encoded_jwt: str = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


async def get_access_token(session: AsyncSession, username: str, password: str) -> Token:
    user: User = await authenticate_user(session, username, password)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token: str = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_async_session),
) -> User:
    try:
        payload: dict[str, Any] = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")

        if username is None:
            raise CredentialsException

        token_data = TokenData(username=username)

    except InvalidTokenError:
        raise CredentialsException

    user: User | None = await get_user(session, username=token_data.username)  # type: ignore

    if user is None:
        raise CredentialsException

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.disabled:
        raise InactiveUserException

    return current_user

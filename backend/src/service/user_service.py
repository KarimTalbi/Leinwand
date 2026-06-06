"""
This module provides services for user authentication and management.

It includes functions for:
- Hashing and verifying passwords.
- Generating and validating JWT access tokens.
- Retrieving, creating, and updating user records in the database.
- Authenticating users and providing FastAPI dependencies for extracting
  the current active user from incoming requests.
"""
from sqlalchemy.orm.attributes import flag_modified
import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

import dotenv
import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
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

DUMMY_HASH: str = password_hash.hash(os.getenv("AUTH_DUMMY_HASH", ""))
SECRET_KEY: str = os.getenv("AUTH_SECRET_KEY", "")
ALGORITHM: str = os.getenv("AUTH_ALGORITHM", "")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("AUTH_ACCESS_TOKEN_EXPIRE_MINUTES", 0))


def get_password_hash(password: str) -> str:
    """
    Generates a secure hash for a given password.

    Args:
        password: The plaintext password to hash.

    Returns:
        The hashed password string.
    """
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored hash.

    Args:
        plain_password: The plaintext password provided by the user.
        hashed_password: The stored hash to compare against.

    Returns:
        True if the password matches the hash, False otherwise.
    """
    return password_hash.verify(plain_password, hashed_password)


async def get_user(session: AsyncSession, username: str) -> User | None:
    """
    Retrieves a user from the database by their username.

    Args:
        session: The asynchronous database session.
        username: The username to search for.

    Returns:
        The User object if found, otherwise None.
    """
    result: Result[tuple[User]] = await session.execute(
        select(User).where(User.username == username)
    )

    return result.scalar_one_or_none()


async def update_username(session: AsyncSession, user_id: str, new_username: str) -> None:
    user: User | None = await session.get(User, user_id)

    if user is None:
        raise UserNotFoundException

    user.username = new_username
    await session.flush()


async def update_password(session: AsyncSession, user_id: str, new_password: str, old_password: str) -> None:
    user: User | None = await session.get(User, user_id)

    if user is None:
        verify_password(old_password, DUMMY_HASH)
        raise UserNotFoundException

    if not verify_password(old_password, user.hashed_password):
        raise InvalidUserOrPasswordException

    user.hashed_password = get_password_hash(new_password)


async def delete_user(session: AsyncSession, user_id: str) -> None:
    user: User | None = await session.get(User, user_id)

    if user is None:
        raise UserNotFoundException

    await session.delete(user)
    await session.flush()


async def update_user_data(session: AsyncSession, data: UserData, user_id: str) -> None:
    """
    Updates the 'user_data' field for a specific user.

    Args:
        session: The asynchronous database session.
        data: The new data to merge into the existing user_data.
        user_id: The ID of the user to update.

    Raises:
        UserNotFoundException: If the user does not exist.
    """
    user: User | None = await session.get(User, user_id)

    if user is None:
        raise UserNotFoundException

    user_data: dict = user.user_data or {}

    for key, value in data.data.items():
        user_data[key] = value

    user.user_data = user_data

    flag_modified(user, "user_data")
    await session.flush()


async def authenticate_user(session: AsyncSession, username: str, password: str) -> User:
    """
    Authenticates a user by verifying their username and password.

    This function protects against timing attacks by verifying a dummy hash
    even if the user is not found.

    Args:
        session: The asynchronous database session.
        username: The provided username.
        password: The provided password.

    Returns:
        The authenticated User object.

    Raises:
        InvalidUserOrPasswordException: If authentication fails.
    """
    user: User | None = await get_user(session, username)

    if user is None:
        verify_password(password, DUMMY_HASH)
        raise InvalidUserOrPasswordException

    if not verify_password(password, user.hashed_password):
        raise InvalidUserOrPasswordException

    return user


async def create_user(session: AsyncSession, user: UserCreate) -> User:
    """
    Creates a new user account in the database.

    Args:
        session: The asynchronous database session.
        user: The user creation data containing username, ID, and plaintext password.

    Returns:
        The newly created User object.

    Raises:
        UserAlreadyExistsException: If a user with the given username already exists.
    """
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
    """
    Creates a JWT access token.

    Args:
        data: The payload data to encode into the token (e.g., subject/username).
        expires_delta: Optional custom expiration time for the token.

    Returns:
        The encoded JWT string.
    """
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
    """
    Authenticates a user and generates a new JWT access token.

    Args:
        session: The asynchronous database session.
        username: The user's username.
        password: The user's plaintext password.

    Returns:
        A Token object containing the access token and its type.
    """
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
    """
    FastAPI dependency to retrieve the current user from a JWT token.

    Args:
        token: The JWT token provided in the Authorization header.
        session: The asynchronous database session.

    Returns:
        The User object associated with the token.

    Raises:
        CredentialsException: If the token is invalid, expired, or the user is not found.
    """
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
    """
    FastAPI dependency to ensure the current authenticated user is active.

    Args:
        current_user: The user retrieved by the get_current_user dependency.

    Returns:
        The active User object.

    Raises:
        InactiveUserException: If the user's account is disabled.
    """
    if current_user.disabled:
        raise InactiveUserException

    return current_user

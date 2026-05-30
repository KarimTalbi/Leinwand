"""
This module defines the API routes for user management and authentication.

It provides endpoints for:
- User login and access token generation.
- Retrieving the profile of the currently authenticated user.
- Creating a new user account.
- Updating user-specific application data.

The routes handle authentication, database session management, and data
validation using dependencies and Pydantic models.
"""
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from data import Token, UserAuth, UserCreate, UserRead, get_async_session, UserData
from service.user_service import create_user, get_access_token, get_current_active_user, update_user


user_router = APIRouter(prefix="/users", tags=["users"])


@user_router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    """
    Provides an access token for a user given a username and password.

    This endpoint follows the OAuth2 password flow.

    Args:
        form_data: The OAuth2 password request form, containing username and password.
        session: The database session.

    Returns:
        An access token and token type.
    """
    return await get_access_token(session, form_data.username, form_data.password)


@user_router.get("/me", response_model=UserRead)
async def read_users_me(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
) -> Any:
    """
    Retrieves the profile of the currently authenticated user.

    Args:
        current_user: The authenticated user making the request.

    Returns:
        The user's profile information.
    """
    return current_user


@user_router.post("/create", response_model=UserRead)
async def create_users(user: UserCreate, session: AsyncSession = Depends(get_async_session)) -> Any:
    """
    Creates a new user account.

    Args:
        user: The user creation data, including username and password.
        session: The database session.

    Returns:
        The newly created user's profile information.
    """
    return await create_user(session, user)


@user_router.put("/update")
async def update_user_data(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    data: UserData,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    """
    Updates the application-specific data for the current user.

    Args:
        current_user: The authenticated user making the request.
        data: The new user data to be stored.
        session: The database session.
    """
    await update_user(session, data, current_user.id)

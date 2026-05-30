"""
This module provides services for managing canvases in the database.

It includes functions for:
- Creating a new canvas for a user.
- Listing all canvases belonging to a user.
- Deleting a user's canvas.
- Updating the metadata of a canvas, such as its last updated time or name.
"""
from sqlalchemy import Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select

from data import CanvasRead
from data.db_models import Canvas
from exceptions import CanvasNotFoundException


async def create_canvas(session: AsyncSession, canvas: CanvasRead, user_id: str) -> None:
    """
    Creates a new canvas and associates it with a user.

    Args:
        session: The asynchronous database session.
        canvas: The canvas data to be used for creation.
        user_id: The ID of the user who will own the canvas.
    """
    new_canvas = Canvas(**canvas.model_dump(), user_id=user_id)
    session.add(new_canvas)
    await session.flush()


async def list_canvases(session: AsyncSession, user_id: str) -> list[Canvas]:
    """
    Retrieves all canvases associated with a specific user.

    Args:
        session: The asynchronous database session.
        user_id: The ID of the user whose canvases to retrieve.

    Returns:
        A list of Canvas objects.
    """
    result: Result[tuple[Canvas]] = await session.execute(
        select(Canvas).where(Canvas.user_id == user_id)
    )
    return list(result.scalars().all())


async def delete_canvas(session: AsyncSession, canvas_id: str, user_id: str) -> None:
    """
    Deletes a specific canvas belonging to a user.

    Args:
        session: The asynchronous database session.
        canvas_id: The ID of the canvas to delete.
        user_id: The ID of the user, for ownership verification.

    Raises:
        CanvasNotFoundException: If the canvas does not exist or does not belong to the user.
    """
    canvas: Canvas | None = await session.get(Canvas, canvas_id)

    if canvas is None or canvas.user_id != user_id:
        raise CanvasNotFoundException

    await session.delete(canvas)
    await session.flush()


async def update_canvas_data(session: AsyncSession, canvas_id: str, updated_at: int) -> None:
    """
    Updates the 'updated_at' timestamp for a specific canvas.

    Args:
        session: The asynchronous database session.
        canvas_id: The ID of the canvas to update.
        updated_at: The new timestamp.

    Raises:
        CanvasNotFoundException: If the canvas does not exist.
    """
    canvas: Canvas | None = await session.get(Canvas, canvas_id)

    if canvas is None:
        raise CanvasNotFoundException

    canvas.updated_at = updated_at
    await session.flush()


async def update_canvas_name(session: AsyncSession, canvas_id: str, name: str) -> None:
    """
    Updates the name of a specific canvas.

    Args:
        session: The asynchronous database session.
        canvas_id: The ID of the canvas to update.
        name: The new name for the canvas.

    Raises:
        CanvasNotFoundException: If the canvas does not exist.
    """
    canvas: Canvas | None = await session.get(Canvas, canvas_id)

    if not canvas:
        raise CanvasNotFoundException

    canvas.name = name
    await session.flush()

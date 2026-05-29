from sqlalchemy import Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select

from data import CanvasRead
from data.db_models import Canvas
from exceptions import CanvasNotFoundException


async def create_canvas(session: AsyncSession, canvas: CanvasRead, user_id: str) -> None:
    new_canvas = Canvas(**canvas.model_dump(), user_id=user_id)
    session.add(new_canvas)
    await session.flush()


async def list_canvases(session: AsyncSession, user_id: str) -> list[Canvas]:
    result: Result[tuple[Canvas]] = await session.execute(
        select(Canvas).where(Canvas.user_id == user_id)
    )
    return list(result.scalars().all())


async def delete_canvas(session: AsyncSession, canvas_id: str, user_id: str) -> None:
    canvas: Canvas | None = await session.get(Canvas, canvas_id)

    if canvas is None or canvas.user_id != user_id:
        raise CanvasNotFoundException

    await session.delete(canvas)
    await session.flush()


async def update_canvas_data(session: AsyncSession, canvas_id: str, updated_at: int) -> None:
    canvas: Canvas | None = await session.get(Canvas, canvas_id)

    if canvas is None:
        raise CanvasNotFoundException

    canvas.updated_at = updated_at
    await session.flush()


async def update_canvas_name(session: AsyncSession, canvas_id: str, name: str) -> None:
    canvas: Canvas | None = await session.get(Canvas, canvas_id)

    if not canvas:
        raise CanvasNotFoundException

    canvas.name = name
    await session.flush()

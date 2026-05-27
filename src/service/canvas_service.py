from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select

from data import CanvasRead
from data.db_models import Canvas
from exceptions import CanvasNotFoundException


async def create_canvas(session: AsyncSession, canvas: CanvasRead, user_id: str) -> None:
    new_canvas = Canvas(**canvas.model_dump(), user_id=user_id)
    session.add(new_canvas)


async def list_canvases(session: AsyncSession, user_id: str) -> list[Canvas]:
    result = await session.execute(select(Canvas).where(Canvas.user_id == user_id))
    return list(result.scalars().all())


async def delete_canvas(session: AsyncSession, canvas_id: str, user_id: str) -> None:
     await session.execute(
        delete(Canvas).where(Canvas.user_id == user_id).where(Canvas.id == canvas_id))



async def update_canvas_data(session: AsyncSession, canvas_id: str, updated_at: int) -> None:
    canvas = await session.get(Canvas, canvas_id)

    if not canvas:
        raise CanvasNotFoundException

    canvas.updated_at = updated_at

    await session.flush()


async def update_canvas_name(session: AsyncSession, canvas_id: str, name: str) -> None:
    canvas = await session.get(Canvas, canvas_id)

    if not canvas:
        raise CanvasNotFoundException

    canvas.name = name

    await session.flush()

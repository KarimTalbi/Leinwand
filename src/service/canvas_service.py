from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select

from data import CanvasCreate, CanvasUpdate
from data.db_models import Canvas
from exceptions import CanvasNotFoundException


async def get_canvas(session: AsyncSession, canvas_id: UUID, user_id: UUID) -> Canvas:
    result = await session.execute(
        select(Canvas).where(Canvas.id == canvas_id, Canvas.user_id == user_id)
    )
    canvas = result.scalar_one_or_none()

    if not canvas:
        raise CanvasNotFoundException

    return canvas


async def create_canvas(
    session: AsyncSession, canvas: CanvasCreate, user_id: UUID
) -> Canvas:
    new_canvas = Canvas(**canvas.model_dump(), user_id=user_id)
    session.add(new_canvas)

    await session.flush()
    await session.refresh(new_canvas)

    return new_canvas


async def list_canvases(session: AsyncSession, user_id: UUID) -> list[Canvas]:
    result = await session.execute(select(Canvas).where(Canvas.user_id == user_id))
    return list(result.scalars().all())


async def update_canvas(
    session: AsyncSession, canvas_update: CanvasUpdate, canvas_id: UUID, user_id: UUID
) -> Canvas:
    canvas = await get_canvas(session, canvas_id, user_id)

    for key, value in canvas_update.model_dump(exclude_unset=True).items():
        setattr(canvas, key, value)

    await session.flush()
    await session.refresh(canvas)

    return canvas


async def delete_canvas(session: AsyncSession, canvas_id: UUID, user_id: UUID) -> UUID:
    canvas = await get_canvas(session, canvas_id, user_id)

    await session.delete(canvas)
    await session.flush()

    return canvas_id

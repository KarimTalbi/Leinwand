import datetime

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select

from data import CanvasRead
from data.db_models import Canvas, Owner
from exceptions import CanvasNotFoundException


async def create_canvas(session: AsyncSession, canvas: CanvasRead, user_id: str) -> None:
    new_canvas = Canvas(**canvas.model_dump())
    session.add(new_canvas)

    await session.flush()
    await session.refresh(new_canvas)

    ownership = Owner(user_id=user_id, canvas_id=new_canvas.id, role="owner")
    session.add(ownership)

    await session.flush()


async def list_canvases(session: AsyncSession, user_id: str) -> list[Canvas]:
    result = await session.execute(
        select(Canvas).join(Owner).where(Owner.user_id == user_id, Canvas.id == Owner.canvas_id)
    )
    return list(result.scalars().all())


async def delete_canvas(session: AsyncSession, canvas_id: str, user_id: str) -> None:
    result = await session.execute(
        delete(Owner)
        .where(Owner.user_id == user_id)
        .where(Owner.canvas_id == canvas_id)
        .returning(Owner.canvas_id)
    )

    deleted_id = result.scalar_one_or_none()

    if not deleted_id:
        raise CanvasNotFoundException

    has_owners = await session.execute(select(Owner).where(Owner.canvas_id == canvas_id))

    owners = has_owners.scalar_one_or_none()

    if not owners:
        await session.execute(delete(Canvas).where(Canvas.id == canvas_id))


async def delete_all_canvases(session: AsyncSession, user_id: str) -> None:
    canvases = await list_canvases(session, user_id)

    for canvas in canvases:
        await delete_canvas(session, canvas.id, user_id)


async def update_canvas_data(session: AsyncSession, canvas_id: str, node_count: int) -> None:
    canvas = await session.get(Canvas, canvas_id)
    if not canvas:
        raise CanvasNotFoundException

    canvas.data["updated_at"] = datetime.datetime.now(datetime.timezone.utc).strftime("%m/%d/%Y - %H:%M UTC")
    canvas.data["node_count"] = node_count

    await session.flush()

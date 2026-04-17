from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import select

from src.data.db_models import Canvas


async def get_canvas(canvas_id: int, session: AsyncSession):
    stmt = (
        select(Canvas)
        .where(Canvas.id == canvas_id)
        .options(selectinload(Canvas.nodes), selectinload(Canvas.edges))
    )
    canvas = await session.execute(stmt)
    return canvas.scalar_one()

from typing import Sequence
from sqlalchemy import UUID, select
from sqlalchemy.ext.asyncio import AsyncSession
from data import EdgeCreate, Edge, Canvas


async def create_edge(session: AsyncSession, edge_create: EdgeCreate) -> Edge:
    edge = Edge(**edge_create.model_dump())
    session.add(edge)

    await session.flush()
    await session.refresh(edge)

    return edge


async def list_edges(
    session: AsyncSession, user_id: UUID, canvas_id: UUID
) -> Sequence[Edge]:
    result = await session.execute(
        select(Edge)
        .join(Canvas)
        .where(Canvas.user_id == user_id, Edge.canvas_id == canvas_id)
    )
    return result.scalars().all()


async def get_edge(session: AsyncSession, edge_id: UUID, user_id: UUID) -> Edge | None:
    result = await session.execute(
        select(Edge).join(Canvas).where(Edge.id == edge_id, Canvas.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def delete_edge(session: AsyncSession, edge_id: UUID, user_id: UUID) -> UUID:
    db_edge = await get_edge(session, edge_id, user_id)

    await session.delete(db_edge)
    await session.flush()

    return edge_id

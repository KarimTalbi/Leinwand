import uuid
from typing import Sequence, overload

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data import EdgeCreate, Edge
from utils import EdgeNotFoundException


class EdgeService:
    def __init__(self, session: AsyncSession, user_id: uuid.UUID):
        self.db = session
        self.user_id = user_id

    async def create(self, edge: EdgeCreate) -> Edge:
        new_edge = Edge(**edge.model_dump())

        self.db.add(new_edge)

        await self.db.flush()
        await self.db.refresh(new_edge)

        return edge

    @overload
    async def read(self, edge_id: None = ...) -> Sequence[Edge] | None: ...

    @overload
    async def read(self, edge_id: uuid.UUID = ...) -> Edge | None: ...

    async def read(self, edge_id: uuid.UUID | None = None) -> Edge | Sequence[Edge]:
        if edge_id:

            edge = await self.db.get(Edge, edge_id)
            if not edge:

                raise EdgeNotFoundException

            return await self.db.get(Edge, edge_id)

        result = await self.db.execute(select(Edge))

        return result.scalars().all()

    async def delete(self, edge_id: uuid.UUID) -> uuid.UUID:
        edge = await self.read(edge_id)

        await self.db.delete(edge)
        await self.db.flush()

        return edge_id

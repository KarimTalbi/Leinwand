import uuid
from typing import Sequence, overload

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data import NodeCreate, Node, NodeUpdate
from utils import NodeNotFoundException


class NodeService:
    def __init__(self, session: AsyncSession, user_id: uuid.UUID):
        self.db = session

    async def create(self, node: NodeCreate) -> Node:
        new_node = Node(**node.model_dump())

        self.db.add(new_node)

        await self.db.flush()
        await self.db.refresh(new_node)

        return new_node

    @overload
    async def read(self, node_id: None = ...) -> Sequence[Node] | None: ...

    @overload
    async def read(self, node_id: uuid.UUID = ...) -> Node | None: ...

    async def read(self, node_id: uuid.UUID | None = None) -> Node | Sequence[Node]:
        if node_id:

            node = await self.db.get(Node, node_id)
            if not node:

                raise NodeNotFoundException

            return await self.db.get(Node, node_id)

        result = await self.db.execute(select(Node))

        return result.scalars().all()

    async def update(self, node: NodeUpdate) -> Node:
        db_node = await self.read(node.id)

        for key, value in node.model_dump(exclude_unset=True).items():
            setattr(db_node, key, value)

        await self.db.flush()
        await self.db.refresh(db_node)

        return db_node

    async def delete(self, node_id: uuid.UUID) -> uuid.UUID:
        node = await self.read(node_id)

        await self.db.delete(node)
        await self.db.flush()

        return node_id

    async def ancestors(self): ...

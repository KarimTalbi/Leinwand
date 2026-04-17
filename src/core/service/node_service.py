from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data import NodeCreate, Node, NodeUpdate, Canvas, EdgeCreate, Edge


class NodeService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, node: NodeCreate, user_id: UUID) -> Node:
        node.user_id = user_id
        new_node = Node(**node.model_dump())

        self.session.add(new_node)

        await self.session.flush()
        await self.session.refresh(new_node)

        return new_node

    async def list(self, user_id: UUID, canvas_id: UUID) -> Sequence[Node]:
        result = await self.session.execute(
            select(Node)
            .join(Canvas)
            .where(Canvas.user_id == user_id, Node.canvas_id == canvas_id)
        )
        return result.scalars().all()

    async def get(self, node_id: UUID, user_id: UUID) -> Node | None:
        result = await self.session.execute(
            select(Node)
            .join(Canvas)
            .where(Node.id == node_id, Canvas.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def update(self, node: NodeUpdate, user_id: UUID) -> Node:
        db_node = await self.get(node.id, user_id)

        for key, value in node.model_dump(exclude_unset=True).items():
            setattr(db_node, key, value)

        await self.session.flush()
        await self.session.refresh(db_node)

        return db_node

    async def delete(self, node_id: UUID, user_id: UUID) -> UUID:
        db_node = await self.get(node_id, user_id)

        await self.session.delete(db_node)
        await self.session.flush()

        return node_id


class EdgeService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, edge: EdgeCreate, user_id: UUID) -> Edge:
        edge.user_id = user_id
        new_edge = Edge(**edge.model_dump())

        self.session.add(new_edge)

        await self.session.flush()
        await self.session.refresh(new_edge)

        return new_edge

    async def list(self, user_id: UUID, canvas_id: UUID) -> Sequence[Edge]:
        result = await self.session.execute(
            select(Edge)
            .join(Canvas)
            .where(Canvas.user_id == user_id, Edge.canvas_id == canvas_id)
        )
        return result.scalars().all()

    async def get(self, edge_id: UUID, user_id: UUID) -> Edge | None:
        result = await self.session.execute(
            select(Edge)
            .join(Canvas)
            .where(Edge.id == edge_id, Canvas.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def delete(self, edge_id: UUID, user_id: UUID) -> UUID:
        db_edge = await self.get(edge_id, user_id)

        await self.session.delete(db_edge)
        await self.session.flush()

        return edge_id


class CanvasService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, user_id: UUID) -> Canvas:
        canvas = Canvas(user_id=user_id)
        self.session.add(canvas)
        await self.session.flush()
        await self.session.refresh(canvas)
        return canvas

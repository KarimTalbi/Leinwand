import asyncio
from typing import TypeVar, Generic, List, Optional, Type
from uuid import UUID
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from data import Base, Node, Edge, NodeUpdate, NodeCreate, EdgeUpdate, EdgeCreate, CanvasRead

T = TypeVar("T", bound=Base)
C = TypeVar("C", bound=BaseModel)
U = TypeVar("U", bound=BaseModel)


class BaseService(Generic[T, C, U]):
    def __init__(self, model: Type[T], session: AsyncSession):
        self.model = model
        self.session = session

    async def list(self, offset: int = 0, limit: int = 100) -> List[T]:
        stmt = (
            select(self.model).offset(offset).limit(limit)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, create_schema: C) -> T:
        instance = self.model(**create_schema.model_dump())

        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)

        return instance

    async def read(self, instance_id: UUID) -> Optional[T]:
        return await self.session.get(self.model, instance_id)

    async def update(self, instance_id: UUID, update_instance: U) -> Optional[T]:
        instance = await self.read(instance_id)

        if instance:
            instance_data = update_instance.model_dump(exclude_unset=True)

            for key, value in instance_data.items():
                setattr(instance, key, value)

            self.session.add(instance)
            await self.session.commit()
            await self.session.refresh(instance)

        return instance

    async def delete(self, instance_id: UUID) -> bool:
        instance = await self.read(instance_id)

        if instance:
            await self.session.delete(instance)
            await self.session.commit()
            return True

        return False


class NodeService(BaseService[Node, NodeCreate, NodeUpdate]):
    def __init__(self, session: AsyncSession):
        super().__init__(
            Node, session
        )


class EdgeService(BaseService[Edge, EdgeCreate, EdgeUpdate]):
    def __init__(self, session: AsyncSession):
        super().__init__(
            Edge, session
        )


class CanvasService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.node_service = NodeService(session)
        self.edge_service = EdgeService(session)

    async def get(self) -> CanvasRead:

        nodes, edges = await asyncio.gather(
            self.node_service.list(),
            self.edge_service.list()
        )

        return CanvasRead(nodes=nodes, edges=edges)


    async def save(self, canvas: CanvasRead):

        out_nodes, out_edges = await asyncio.gather(
            self.node_service.list(),
            self.edge_service.list()
        )

        out_node_ids = {n.id for n in out_nodes}
        out_edge_ids = {e.id for e in out_edges}

        in_node_ids = {n.id for n in canvas.nodes if n.id}
        in_edge_ids = {e.id for e in canvas.edges if e.id}

        for n_id in (out_node_ids - in_node_ids):
            await self.node_service.delete(n_id)


        for n in canvas.nodes:
            if n.id in out_node_ids:
                await self.node_service.update(
                    n.id, NodeUpdate(**n.model_dump(exclude={"id"}))
                ) #TODO
            else:
                await self.node_service.create(
                    NodeCreate(**n.model_dump(exclude={"id"}))
                )

        for e_id in (out_edge_ids - in_edge_ids):
            await self.edge_service.delete(e_id)

        for e in canvas.edges:
            if e.id in out_edge_ids:
                await self.edge_service.update(
                    e.id,
                    EdgeUpdate(**e.model_dump(exclude={"id"}))
                )
            else:
                await self.edge_service.create(
                    EdgeCreate(**e.model_dump(exclude={"id"}))
                )

        await self.session.commit()
        return await self.get()









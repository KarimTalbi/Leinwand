import asyncio
from uuid import UUID
from typing import Generic, List, Optional, Type, Tuple, Set

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from utils import is_valid_uuid, log_performance
from data import (
    Node, NodeRead, NodeCreate, NodeUpdate,
    Edge, EdgeRead, EdgeCreate, EdgeUpdate,
    CanvasRead,
    SyncTask, T, C, R, U
)


class BaseService(Generic[T, C, U]):
    def __init__(self, model: Type[T], session: AsyncSession):
        self.model = model
        self.session = session

    @log_performance
    async def list(self, offset: int = 0, limit: int = 100) -> List[T]:
        result = await self.session.execute(
            select(self.model).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    @log_performance
    async def list_ids(self, offset: int = 0, limit: int = 100) -> List[UUID]:
        result = await self.session.execute(
            select(self.model.id).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    @log_performance
    async def create(self, create_schema: C) -> T:
        instance = self.model(**create_schema.model_dump())

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)

        return instance

    @log_performance
    async def create_many(self, create_schemas: List[C]):
        if create_schemas:
            instances = [
                self.model(**create_schema.model_dump()) for create_schema in create_schemas
            ]
            self.session.add_all(instances)

    @log_performance
    async def read(self, instance_id: UUID) -> Optional[T]:
        return await self.session.get(
            self.model, instance_id
        )

    @log_performance
    async def update(self, instance_id: UUID, update_instance: U) -> Optional[T]:
        instance = await self.read(instance_id)

        if instance:
            instance_data = update_instance.model_dump(exclude_unset=True)

            for key, value in instance_data.items():
                setattr(instance, key, value)

            self.session.add(instance)
            await self.session.flush()
            await self.session.refresh(instance)

        return instance

    @log_performance
    async def delete(self, instance_id: UUID) -> bool:
        instance = await self.read(instance_id)

        if instance:
            await self.session.delete(instance)
            return True

        return False

    @log_performance
    async def delete_many(self, instance_ids: List[UUID]):
        if instance_ids:
            await self.session.execute(
                delete(self.model).where(self.model.id.in_(instance_ids))
            )


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

    @log_performance
    async def get(self) -> Tuple[List[Node], List[Edge]]:
        return await asyncio.gather(
            self.node_service.list(),
            self.edge_service.list()
        )

    @log_performance
    async def get_ids(self) -> Tuple[List[UUID], List[UUID]]:
        return await asyncio.gather(
            self.node_service.list_ids(),
            self.edge_service.list_ids()
        )

    @log_performance
    async def read(self) -> CanvasRead:
        nodes, edges = await self.get()

        return CanvasRead(
            nodes=[NodeRead.model_validate(nodes)],
            edges=[EdgeRead.model_validate(edges)]
        )

    @staticmethod
    async def _sync_entities(
            items: List[R],
            db_ids: Set[UUID],
            service: BaseService,
            create_schema: Type[C],
            update_schema: Type[U]
    ):
        await service.delete_many(
            list(db_ids - {i.id for i in items if i.id})
        )

        to_create = []
        for item in items:
            if is_valid_uuid(item.id) and item.id in db_ids:
                await service.update(
                    item.id, update_schema(**item.model_dump(exclude={"id"}))
                )

            else:
                to_create.append(
                    create_schema(**item.model_dump(exclude={"id"}))
                )

        if to_create:
            await service.create_many(to_create)

    @log_performance
    async def save(self, canvas: CanvasRead):
        async with self.session.begin():
            db_nodes_ids, db_edges_ids = [
                set(res) for res in await self.get_ids()
            ]

            sync_plan: List[SyncTask] = [
                SyncTask(
                    items=canvas.nodes,
                    db_ids=db_nodes_ids,
                    service=self.node_service,
                    create_schema=NodeCreate,
                    update_schema=NodeUpdate
                ),
                SyncTask(
                    items=canvas.edges,
                    db_ids=db_edges_ids,
                    service=self.edge_service,
                    create_schema=EdgeCreate,
                    update_schema=EdgeUpdate
                )
            ]

            for task in sync_plan:
                await self._sync_entities(**task)
                await self.session.flush()

            return await self.read()

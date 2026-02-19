import asyncio
from uuid import UUID
from typing import Generic, List, Type, Set, overload, Literal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from utils import is_valid_uuid, log_performance, extract_ids, to_read_model
from data import (
    Node,
    NodeRead,
    NodeCreate,
    NodeUpdate,
    NodeMap,
    Edge,
    EdgeRead,
    EdgeCreate,
    EdgeUpdate,
    EdgeMap,
    CanvasRead,
    SyncTask,
    T,
    C,
    R,
    U,
    M,
)

ServiceMode = Literal["default", "id", "read", "mapped"]
CanvasMode = ServiceMode | Literal["canvas"]
CanvasResult = CanvasRead | tuple[list[NodeRead], list[EdgeRead]] | tuple[list[Node], list[Edge]] | tuple[NodeMap, EdgeMap] | tuple[str, str]

class BaseService(Generic[T, C, U, R, M]):
    model: Type[T]
    read_schema: Type[R]
    map_schema: Type[M]

    def __init__(self, session: AsyncSession):
        self.session = session

    @overload
    async def all(
        self, offset: int = ..., limit: int = ..., mode: Literal["default"] = ...
    ) -> list[T]: ...

    @overload
    async def all(
        self, offset: int = ..., limit: int = ..., mode: Literal["id"] = ...
    ) -> list[str]: ...

    @overload
    async def all(
        self, offset: int = ..., limit: int = ..., mode: Literal["read"] = ...
    ) -> list[R]: ...

    @overload
    async def all(
        self, offset: int = ..., limit: int = ..., mode: Literal["mapped"] = ...
    ) -> list[M]: ...

    @log_performance
    async def all(
        self,
        offset: int = 0,
        limit: int = 1000,
        mode: ServiceMode = "default",
    ) -> list[T] | list[str] | list[R] | list[M]:

        result = await self.session.execute(
            select(self.model).offset(offset).limit(limit)
        )
        result_ = list(result.scalars().all())

        if mode == "id":
            return extract_ids(result_)
        if mode == "read":
            return to_read_model(self.read_schema, result_)
        if mode == "mapped":
            return self.map_schema.from_list(to_read_model(self.read_schema, result_))
        return result_

    @log_performance
    async def add(self, create_schemas: C | list[C]) -> None:
        if isinstance(create_schemas, list):
            instances = [self.model(**c.model_dump()) for c in create_schemas]
            self.session.add_all(instances)

        else:
            instance = self.model(**create_schemas.model_dump())
            self.session.add(instance)

    @overload
    async def get(self, instance_ids: list[UUID], mode: None = ...) -> list[T]: ...

    @overload
    async def get(
        self, instance_id: list[UUID], mode: Literal["read"] = ...
    ) -> list[R]: ...

    @overload
    async def get(
        self, instance_id: list[UUID], mode: Literal["mapped"] = ...
    ) -> list[M]: ...

    @overload
    async def get(self, instance_id: UUID, mode: None = ...) -> T: ...

    @overload
    async def get(self, instance_ids: UUID, mode: Literal["read"] = ...) -> R: ...

    @overload
    async def get(self, instance_ids: UUID, mode: Literal["mapped"] = ...) -> M: ...

    @log_performance
    async def get(
        self,
        instance_ids: UUID | list[UUID],
        mode: Literal["read", "mapped"] | None = None,
    ) -> T | list[T]:

        if isinstance(instance_ids, list):
            query = select(self.model).where(self.model.id.in_(instance_ids))
            result = await self.session.execute(query)
            nodes = list(result.scalars().all())

            node_ids = {node.id for node in nodes}
            missing_ids = set(instance_ids) - node_ids

            if missing_ids:
                raise ValueError(f"Some instances not found: {missing_ids}")

            if mode:
                read_ = to_read_model(self.read_schema, nodes)

                if mode == "read":
                    return read_
                if mode == "mapped":
                    return self.map_schema.from_list(read_)

            return nodes

        instance = await self.session.get(self.model, instance_ids)

        if not instance:
            raise ValueError(f"Instance not found: {instance_ids}")

        if mode == "read":
            return to_read_model(self.read_schema, [instance])
        if mode == "mapped":
            return self.map_schema.from_list([instance])

        return instance

    @log_performance
    async def update(self, instance_id: UUID, update_instance: U) -> None:
        instance = await self.get(instance_id)

        if instance:
            instance_data = update_instance.model_dump(exclude_unset=True)

            for key, value in instance_data.items():
                setattr(instance, key, value)

        else:
            raise ValueError(f"Instance not found: {instance_id}")

    @log_performance
    async def delete(self, instance_ids: UUID | list[UUID]) -> None:
        if isinstance(instance_ids, list):
            await self.session.execute(
                delete(self.model).where(self.model.id.in_(instance_ids))
            )

        else:
            instances = await self.get(instance_ids)

            if instances:
                await self.session.delete(instances)


class NodeService(BaseService[Node, NodeCreate, NodeUpdate, NodeRead, NodeMap]):
    model = Node
    read_schema = NodeRead
    map_schema = NodeMap

    def __init__(self, session: AsyncSession):
        super().__init__(session)


class EdgeService(BaseService[Edge, EdgeCreate, EdgeUpdate, EdgeRead, EdgeMap]):
    model = Edge
    read_schema = EdgeRead
    map_schema = EdgeMap

    def __init__(self, session: AsyncSession):
        super().__init__(session)


class CanvasService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.node_service = NodeService(session)
        self.edge_service = EdgeService(session)

    @overload
    async def get(
        self, mode: Literal["default"] = ...
    ) -> tuple[list[Node], list[Edge]]: ...

    @overload
    async def get(self, mode: Literal["canvas"] = ...) -> CanvasRead: ...

    @overload
    async def get(
        self, mode: Literal["read"] = ...
    ) -> tuple[list[NodeRead], list[EdgeRead]]: ...

    @overload
    async def get(self, mode: Literal["id"] = ...) -> tuple[list[UUID], list[UUID]]: ...

    @overload
    async def get(self, mode: Literal["mapped"] = ...) -> tuple[NodeMap, EdgeMap]: ...

    @log_performance
    async def get(self, mode: CanvasMode = "default") -> CanvasResult:
        m = mode if mode != "canvas" else "read"
        result = await asyncio.gather(
            self.node_service.all(mode=m),
            self.edge_service.all(mode=m)
        )

        return (
            result if mode != "canvas" else CanvasRead(nodes=result[0], edges=result[1])
        )

    @staticmethod
    async def _sync_entities(
        items: List[R],
        db_ids: Set[UUID],
        service: BaseService,
        create_schema: Type[C],
        update_schema: Type[U],
    ):
        await service.delete(list(db_ids - {i.id for i in items if i.id}))

        to_create = []
        for item in items:
            if is_valid_uuid(item.id) and item.id in db_ids:
                await service.update(
                    item.id, update_schema(**item.model_dump(exclude={"id"}))
                )

            else:
                to_create.append(create_schema(**item.model_dump(exclude={"id"})))

        if to_create:
            await service.add(to_create)

    @log_performance
    async def save(self, canvas: CanvasRead):
        async with self.session.begin():
            db_nodes_ids, db_edges_ids = [set(res) for res in await self.get(mode="id")]

            sync_plan: List[SyncTask] = [
                SyncTask(
                    items=canvas.nodes,
                    db_ids=db_nodes_ids,
                    service=self.node_service,
                    create_schema=NodeCreate,
                    update_schema=NodeUpdate,
                ),
                SyncTask(
                    items=canvas.edges,
                    db_ids=db_edges_ids,
                    service=self.edge_service,
                    create_schema=EdgeCreate,
                    update_schema=EdgeUpdate,
                ),
            ]

            for task in sync_plan:
                await self._sync_entities(**task)
                await self.session.flush()

            return await self.get(mode="canvas")

import asyncio
from collections.abc import Sequence
from uuid import UUID
from typing import Generic, List, Type, Set, overload, Literal, TypeVar, TypedDict, Any

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.dialects.postgresql import insert

from utils import is_valid_uuid
from data import (
    Node,
    NodeRead,
    NodeCreate,
    NodeUpdate,
    Edge,
    EdgeRead,
    EdgeCreate,
    EdgeUpdate,
    Base,
)


class DomainError(Exception): ...


class ResourceNotFoundError(DomainError):
    def __init__(self, service: object, ids: list[UUID]):
        service_name = service.__class__.__name__.replace("Service", "")
        self.message = f"{service_name} not found: {ids}"
        super().__init__(self.message)


_DBModelT = TypeVar("_DBModelT", bound=Base)
_CreateT = TypeVar("_CreateT", bound=BaseModel)
_UpdateT = TypeVar("_UpdateT", bound=BaseModel)
_ReadT = TypeVar("_ReadT", bound=BaseModel)


class _SyncTask(TypedDict):
    items: List[BaseModel]
    db_ids: Set[UUID]
    service: Any
    create_schema: Type[BaseModel]
    update_schema: Type[BaseModel]


class BaseService(Generic[_DBModelT, _CreateT, _UpdateT, _ReadT]):
    model: Type[_DBModelT]
    read_schema: Type[_ReadT]

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_read(self, item: _DBModelT | None) -> _ReadT | None:
        return self.read_schema.model_validate(item) if item else None

    def _to_read_seq(self, items: Sequence[_DBModelT] | None) -> list[_ReadT] | None:
        return [self._to_read(i) for i in items] if items else None

    async def all(
        self,
        offset: int = 0,
        limit: int = 1000,
        return_type: Literal[
            "DBModel", "ReadModel", "ID", "MappedDB", "MappedRead"
        ] = "DBModel",
    ) -> (
        list[_DBModelT]
        | list[_ReadT]
        | list[UUID]
        | dict[UUID, _DBModelT]
        | dict[UUID, _ReadT]
    ):
        result = await self.session.execute(
            select(self.model).offset(offset).limit(limit)
        )

        if return_type in ["DBModel", "MappedDB", "ID"]:
            return result.scalars().all()



        return list(result.scalars().all())

    async def add(self, create_schema: _CreateT) -> _ReadT:
        instance = self.model(**create_schema.model_dump())

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)

        return self._to_read(instance)

    async def add_many(self, create_schemas: list[_CreateT]) -> list[_ReadT]:
        data = [c.model_dump() for c in create_schemas]

        result = await self.session.execute(
            insert(self.model).values(data).returning(self.model)
        )

        return self._to_read_seq(result.scalars().all())

    async def get(self, instance_id: UUID) -> _ReadT:
        result = await self.session.get(self.model, instance_id)

        if not result:
            raise ResourceNotFoundError(service=self, ids=[instance_id])

        return self._to_read(result)

    async def get_many(self, instance_ids: list[UUID]) -> list[_ReadT]:
        result = await self.session.execute(
            select(self.model).where(self.model.id.in_(instance_ids))
        )

        nodes = result.scalars().all()

        node_ids = {node.id for node in nodes}
        missing_ids = set(instance_ids) - node_ids

        if missing_ids:
            raise ResourceNotFoundError(service=self, ids=list(missing_ids))

        return self._to_read_seq(nodes)

    async def update(self, instance_id: UUID, update_instance: _UpdateT) -> None:
        instance = await self.get(instance_id)

        instance_data = update_instance.model_dump(exclude_unset=True)

        for key, value in instance_data.items():
            setattr(instance, key, value)

        await self.session.flush()
        await self.session.refresh(instance)

        return self._to_read(instance)

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

    async def get(
        self, mode: Literal["default", "id", "read", "mapped", "canvas"] = "default"
    ) -> (
        CanvasRead
        | tuple[list[NodeRead], list[EdgeRead]]
        | tuple[list[Node], list[Edge]]
        | tuple[NodeMap, EdgeMap]
        | tuple[str, str]
    ):
        m = mode if mode != "canvas" else "read"
        result = await asyncio.gather(
            self.node_service.all(mode=m), self.edge_service.all(mode=m)
        )

        return (
            result if mode != "canvas" else CanvasRead(nodes=result[0], edges=result[1])
        )

    @staticmethod
    async def _sync_entities(
        items: List[_ReadT],
        db_ids: Set[UUID],
        service: BaseService,
        create_schema: Type[_CreateT],
        update_schema: Type[_UpdateT],
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

    async def save(self, canvas: CanvasRead):
        async with self.session.begin():
            db_nodes_ids, db_edges_ids = [set(res) for res in await self.get(mode="id")]

            sync_plan: List[_SyncTask] = [
                _SyncTask(
                    items=canvas.nodes,
                    db_ids=db_nodes_ids,
                    service=self.node_service,
                    create_schema=NodeCreate,
                    update_schema=NodeUpdate,
                ),
                _SyncTask(
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

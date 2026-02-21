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
    ReadBase
)


class DomainError(Exception): ...


class ResourceNotFoundError(DomainError):
    def __init__(self, service: object, ids: list[UUID]):
        service_name = service.__class__.__name__.replace("Service", "")
        self.message = f"{service_name} not found: {ids}"
        super().__init__(self.message)


_T = TypeVar("_T", bound=Base)
_C = TypeVar("_C", bound=BaseModel)
_U = TypeVar("_U", bound=BaseModel)
_R = TypeVar("_R", bound=ReadBase)


class _SyncTask(TypedDict):
    items: List[BaseModel]
    db_ids: Set[UUID]
    service: Any
    create_schema: Type[BaseModel]
    update_schema: Type[BaseModel]


class BaseService(Generic[_T, _C, _U, _R]):
    model: Type[_T]
    read_schema: Type[_R]

    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_read(self, item: _T | None) -> _R | None:
        return self.read_schema.model_validate(item) if item else None

    def _to_read_seq(self, items: Sequence[_T] | None) -> list[_R] | None:
        return [self._to_read(i) for i in items] if items else None

    @overload
    async def all(
        self, offset: int = ..., limit: int = ..., raw: Literal[False] = ...
    ) -> list[_R]: ...

    @overload
    async def all(
        self, offset: int = ..., limit: int = ..., raw: Literal[True] = ...
    ) -> list[_T]: ...

    @overload
    async def all(
        self, offset: int = ..., limit: int = ..., raw: bool = ...
    ) -> list[_R] | list[_T]: ...

    async def all(
        self, offset: int = 0, limit: int = 1000, raw: bool = False
    ) -> list[_R] | list[_T]:
        result = await self.session.execute(
            select(self.model).offset(offset).limit(limit)
        )
        return (
            list(result.scalars().all())
            if raw
            else self._to_read_seq(result.scalars().all())
        )

    @overload
    async def add(self, create_schema: _C, raw: Literal[False] = ...) -> _R: ...

    @overload
    async def add(self, create_schema: _C, raw: Literal[True] = ...) -> _T: ...

    @overload
    async def add(self, create_schema: _C, raw: bool = ...) -> _R | _T: ...

    async def add(self, create_schema: _C, raw: bool = False) -> _R | _T:
        instance = self.model(**create_schema.model_dump())

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)

        return instance if raw else self._to_read(instance)

    @overload
    async def add_many(
        self, create_schemas: list[_C], raw: Literal[False] = ...
    ) -> list[_R]: ...

    @overload
    async def add_many(
        self, create_schemas: list[_C], raw: Literal[True] = ...
    ) -> list[_T]: ...

    @overload
    async def add_many(
        self, create_schemas: list[_C], raw: bool = ...
    ) -> list[_R] | list[_T]: ...

    async def add_many(
        self, create_schemas: list[_C], raw: bool = False
    ) -> list[_R] | list[_T]:
        data = [c.model_dump() for c in create_schemas]

        result = await self.session.execute(
            insert(self.model).values(data).returning(self.model)
        )

        return (
            list(result.scalars().all())
            if raw
            else self._to_read_seq(result.scalars().all())
        )

    @overload
    async def get(self, instance_id: UUID, raw: Literal[False] = ...) -> _R: ...

    @overload
    async def get(self, instance_id: UUID, raw: Literal[True] = ...) -> _T: ...

    @overload
    async def get(self, instance_id: UUID, raw: bool = ...) -> _R | _T: ...

    async def get(self, instance_id: UUID, raw: bool = False) -> _R | _T:
        result = await self.session.get(self.model, instance_id)

        if not result:
            raise ResourceNotFoundError(service=self, ids=[instance_id])

        return result if raw else self._to_read(result)

    @overload
    async def get_many(
        self, instance_ids: list[UUID], raw: Literal[False] = ...
    ) -> list[_R]: ...

    @overload
    async def get_many(
        self, instance_ids: list[UUID], raw: Literal[True] = ...
    ) -> list[_T]: ...

    @overload
    async def get_many(
        self, instance_ids: list[UUID], raw: bool = ...
    ) -> list[_R] | list[_T]: ...

    async def get_many(
        self, instance_ids: list[UUID], raw: bool = False
    ) -> list[_R] | list[_T]:
        result = await self.session.execute(
            select(self.model).where(self.model.id.in_(instance_ids))
        )

        nodes = result.scalars().all()

        node_ids = {node.id for node in nodes}
        missing_ids = set(instance_ids) - node_ids

        if missing_ids:
            raise ResourceNotFoundError(service=self, ids=list(missing_ids))

        return list(nodes) if raw else self._to_read_seq(nodes)

    @overload
    async def update(
        self, instance_id: UUID, update_instance: _U, raw: Literal[False] = ...
    ) -> _R: ...

    @overload
    async def update(
        self, instance_id: UUID, update_instance: _U, raw: Literal[True] = ...
    ) -> _T: ...

    @overload
    async def update(
        self, instance_id: UUID, update_instance: _U, raw: bool = ...
    ) -> _R | _T: ...

    async def update(
        self, instance_id: UUID, update_instance: _U, raw: bool = False
    ) -> _R | _T:
        instance = await self.get(instance_id)

        instance_data = update_instance.model_dump(exclude_unset=True)

        for key, value in instance_data.items():
            setattr(instance, key, value)

        await self.session.flush()
        await self.session.refresh(instance)

        return instance if raw else self._to_read(instance)

    @overload
    async def upsert(
        self, instances: list[_C], raw: Literal[False] = ...
    ) -> list[_R]: ...

    @overload
    async def upsert(
        self, instances: list[_C], raw: Literal[True] = ...
    ) -> list[_T]: ...

    @overload
    async def upsert(
        self, instances: list[_C], raw: bool = ...
    ) -> list[_R] | list[_T]: ...

    async def upsert(
        self, instances: list[_C], raw: bool = False
    ) -> list[_R] | list[_T]:
        if not instances:
            return []
        data = [i.model_dump() for i in instances]
        stmt = insert(self.model).values(data)

        update_cold = {k: stmt.excluded[k] for k in data[0].keys() if k != "id"}
        stmt = stmt.on_conflict_do_update(index_elements=["id"], set_=update_cold)

        result = await self.session.execute(stmt.returning(self.model))
        await self.session.flush()
        return (
            list(result.scalars().all())
            if raw
            else self._to_read_seq(result.scalars().all())
        )

    async def delete(self, instance_id: UUID) -> UUID:
        deleted = await self._perform_delete([instance_id])
        if not deleted:
            raise ResourceNotFoundError(service=self, ids=[instance_id])
        return deleted[0]

    async def delete_many(self, instance_ids: list[UUID]) -> list[UUID]:
        return await self._perform_delete(instance_ids)

    async def _perform_delete(self, instance_ids: list[UUID]) -> list[UUID]:
        if not instance_ids:
            return []
        result = await self.session.execute(
            delete(self.model).where(
                self.model.id.in_(instance_ids).returning(self.model.id)
            )
        )
        await self.session.flush()
        return list(result.scalars().all())


class NodeService(BaseService[Node, NodeCreate, NodeUpdate, NodeRead]):
    model = Node
    read_schema = NodeRead

    def __init__(self, session: AsyncSession):
        super().__init__(session)


class EdgeService(BaseService[Edge, EdgeCreate, EdgeUpdate, EdgeRead]):
    model = Edge
    read_schema = EdgeRead

    def __init__(self, session: AsyncSession):
        super().__init__(session)


class CanvasService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.node_service = NodeService(session)
        self.edge_service = EdgeService(session)

    async def get(
        self, raw: bool = False
    ) -> tuple[list[NodeRead], list[EdgeRead]] | tuple[list[Node], list[Edge]]:
        result = await asyncio.gather(
            self.node_service.all(raw=raw), self.edge_service.all(raw=raw)
        )

        return result

    @staticmethod
    async def _sync_entities(
        items: List[_R],
        db_ids: Set[UUID],
        service: BaseService,
        create_schema: Type[_C],
        update_schema: Type[_U],
    ):
        await service.delete_many(list(db_ids - {i.id for i in items if i.id}))

        to_create = []
        for item in items:
            if is_valid_uuid(item.id) and item.id in db_ids:
                await service.update(
                    item.id, update_schema(**item.model_dump(exclude={"id"}))
                )

            else:
                to_create.append(create_schema(**item.model_dump(exclude={"id"})))

        if to_create:
            await service.add_many(to_create)

    async def save(self, canvas: tuple[list[NodeRead], list[EdgeRead]] = (None, None)):
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

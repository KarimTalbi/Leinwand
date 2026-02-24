import asyncio
from typing import (
    TYPE_CHECKING,
    Any,
    Generic,
    Literal,
    TypeVar,
    overload,
)
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from .db_models import Base, Edge, Node
from .exceptions import InvalidUUIDError, ResourceNotFoundError, SyncError
from .schemas import (
    CanvasRead,
    CanvasUpdate,
    EdgeCreate,
    EdgeRead,
    EdgeUpdate,
    NodeCreate,
    NodeRead,
    NodeUpdate,
    ReadBase,
    UpdateBase,
)

if TYPE_CHECKING:
    from sqlalchemy.engine import Result


_T = TypeVar("_T", bound=Base)
_C = TypeVar("_C", bound=BaseModel)
_U = TypeVar("_U", bound=UpdateBase)
_R = TypeVar("_R", bound=ReadBase)


class BaseService(Generic[_T, _C, _U, _R]):
    def __init__(
        self,
        session: AsyncSession,
        model: type[_T],
        read_schema: type[_R],
        create_schema: type[_C],
    ) -> None:
        self.session: AsyncSession = session
        self.model: type[_T] = model
        self.read_schema: type[_R] = read_schema
        self.create_schema: type[_C] = create_schema

    def _read(self, entity: _T) -> _R:
        return self.read_schema.model_validate(entity)

    def _read_seq(self, entities: list[_T]) -> list[_R]:
        return [self._read(entity) for entity in entities]

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

        result: Result[tuple[_T]] = await self.session.execute(
            select(self.model).offset(offset).limit(limit)
        )

        entities: list[_T] = list(result.scalars().all())

        if not entities:
            return []

        return entities if raw else self._read_seq(entities)

    async def ids(self) -> list[UUID]:
        result: Result[tuple[UUID]] = await self.session.execute(select(self.model.id))
        return list(result.scalars().all())

    @overload
    async def add(self, payload: _C, raw: Literal[False] = ...) -> _R: ...

    @overload
    async def add(self, payload: _C, raw: Literal[True] = ...) -> _T: ...

    @overload
    async def add(self, payload: _C, raw: bool = ...) -> _R | _T: ...

    async def add(self, payload: _C, raw: bool = False) -> _R | _T:
        entity: _T = self.model(**payload.model_dump())

        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)

        return entity if raw else self._read(entity)

    @overload
    async def add_many(
        self, payloads: list[_C], raw: Literal[False] = ...
    ) -> list[_R]: ...

    @overload
    async def add_many(
        self, payloads: list[_C], raw: Literal[True] = ...
    ) -> list[_T]: ...

    @overload
    async def add_many(
        self, payloads: list[_C], raw: bool = ...
    ) -> list[_R] | list[_T]: ...

    async def add_many(
        self, payloads: list[_C], raw: bool = False
    ) -> list[_R] | list[_T]:

        data: list[dict[str, Any]] = [p.model_dump() for p in payloads]

        result: Result[tuple[_T]] = await self.session.execute(
            insert(self.model).values(data).returning(self.model)
        )

        entities: list[_T] = list(result.scalars().all())

        return entities if raw else self._read_seq(entities)

    @overload
    async def get(self, id_: UUID, raw: Literal[False] = ...) -> _R: ...

    @overload
    async def get(self, id_: UUID, raw: Literal[True] = ...) -> _T: ...

    @overload
    async def get(self, id_: UUID, raw: bool = ...) -> _R | _T: ...

    async def get(self, id_: UUID, raw: bool = False) -> _R | _T:
        entity: _T | None = await self.session.get(self.model, id_)

        if not entity:
            raise ResourceNotFoundError(service=self, ids=[id_])

        return entity if raw else self._read(entity)

    @overload
    async def get_many(
        self, ids: list[UUID], raw: Literal[False] = ...
    ) -> list[_R]: ...

    @overload
    async def get_many(self, ids: list[UUID], raw: Literal[True] = ...) -> list[_T]: ...

    @overload
    async def get_many(
        self, ids: list[UUID], raw: bool = ...
    ) -> list[_R] | list[_T]: ...

    async def get_many(self, ids: list[UUID], raw: bool = False) -> list[_R] | list[_T]:

        result: Result[tuple[_T]] = await self.session.execute(
            select(self.model).where(self.model.id.in_(ids))
        )

        entities: list[_T] = list(result.scalars().all())

        missing_ids: set[UUID] = set(ids) - {entity.id for entity in entities}

        if missing_ids:
            raise ResourceNotFoundError(service=self, ids=list(missing_ids))

        return entities if raw else self._read_seq(entities)

    @overload
    async def update(self, payload: _U, raw: Literal[False] = ...) -> _R: ...

    @overload
    async def update(self, payload: _U, raw: Literal[True] = ...) -> _T: ...

    @overload
    async def update(self, payload: _U, raw: bool = ...) -> _R | _T: ...

    async def update(self, payload: _U, raw: bool = False) -> _R | _T:

        if not isinstance(payload.id, UUID):
            raise InvalidUUIDError(
                service=self, id_=payload.id if isinstance(payload.id, UUID) else None
            )

        entity: _T = await self.get(payload.id, raw=True)

        data: dict[str, Any] = payload.model_dump(exclude_unset=True, exclude={"id"})

        for key, value in data.items():
            setattr(entity, key, value)

        await self.session.flush()
        await self.session.refresh(entity)

        return entity if raw else self._read(entity)

    @overload
    async def update_many(
        self, payloads: list[_U], raw: Literal[False] = ...
    ) -> list[_R]: ...

    @overload
    async def update_many(
        self, payloads: list[_U], raw: Literal[True] = ...
    ) -> list[_T]: ...

    @overload
    async def update_many(
        self, payloads: list[_U], raw: bool = ...
    ) -> list[_R] | list[_T]: ...

    async def update_many(
        self, payloads: list[_U], raw: bool = False
    ) -> list[_R] | list[_T]:

        updated: list[_T] = []

        for payload in payloads:
            u: _R | _T = await self.update(payload, raw=True)
            updated.append(u)

        return updated if raw else self._read_seq(updated)

    async def delete(self, id_: UUID) -> UUID:
        deleted: list[UUID] = await self._perform_delete([id_])
        if not deleted:
            raise ResourceNotFoundError(service=self, ids=[id_])
        return deleted[0]

    async def delete_many(self, ids: list[UUID]) -> list[UUID]:
        return await self._perform_delete(ids)

    async def _perform_delete(self, ids: list[UUID]) -> list[UUID]:
        if not ids:
            return []
        result: Result[tuple[UUID]] = await self.session.execute(
            delete(self.model).where(self.model.id.in_(ids).returning(self.model.id))
        )
        await self.session.flush()
        return list(result.scalars().all())

    async def sync(self, payloads: list[_U]) -> bool:
        db_ids: list[UUID] = await self.ids()

        d: list[UUID] = []
        u: list[_U] = []
        c: list[_C] = []

        for p in payloads:
            if p.id:
                d.append(p.id) if isinstance(p.id, UUID) else None
                u.append(p)
            else:
                c.append(self.create_schema(**p.model_dump(exclude={"id"})))

        await asyncio.gather(
            self.delete_many(list(set(db_ids) - set(d))),
            self.update_many(u),
            self.add_many(c),
        )

        return True


class NodeService(BaseService[Node, NodeCreate, NodeUpdate, NodeRead]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(
            session, model=Node, read_schema=NodeRead, create_schema=NodeCreate
        )


class EdgeService(BaseService[Edge, EdgeCreate, EdgeUpdate, EdgeRead]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(
            session, model=Edge, read_schema=EdgeRead, create_schema=EdgeCreate
        )


class CanvasService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session
        self.node_service: NodeService = NodeService(session)
        self.edge_service: EdgeService = EdgeService(session)

    @overload
    async def get(self, raw: Literal[False] = ...) -> CanvasRead: ...

    @overload
    async def get(self, raw: Literal[True] = ...) -> tuple[list[Node], list[Edge]]: ...

    @overload
    async def get(
        self, raw: bool = ...
    ) -> CanvasRead | tuple[list[Node], list[Edge]]: ...

    async def get(
        self, raw: bool = False
    ) -> CanvasRead | tuple[list[Node], list[Edge]]:
        if raw:
            nodes, edges = await asyncio.gather(
                self.node_service.all(raw=True), self.edge_service.all(raw=True)
            )
            return nodes, edges

        nodes, edges = await asyncio.gather(
            self.node_service.all(raw=False), self.edge_service.all(raw=False)
        )

        return CanvasRead(nodes=nodes, edges=edges)

    async def save(self, data: CanvasUpdate) -> CanvasRead:
        async with self.session.begin():
            node_res, edge_res = await asyncio.gather(
                self.node_service.sync(data.nodes), self.edge_service.sync(data.edges)
            )

            if node_res and edge_res:
                return await self.get()

            else:
                raise SyncError

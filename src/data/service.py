import asyncio
from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    TypeVar,
    get_args,
    overload,
)
from uuid import UUID

from sqlalchemy import delete as delete_
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.db_models import Base, Edge, Node
from src.data.schemas import CanvasRead, CreateBase, EdgeRead, NodeRead, ReadBase, UpdateBase
from utils import service_monitor

if TYPE_CHECKING:
    from sqlalchemy.engine import Result


class ResourceNotFoundError(Exception):
    """Exception raised when a requested resource is not found."""
    ...


_T = TypeVar("_T", bound=Base)
_R = TypeVar("_R", bound=ReadBase)
_C = TypeVar("_C", bound=CreateBase)
_U = TypeVar("_U", bound=UpdateBase)


class BaseService[_T, _R, _C, _U]:
    """
    Base service for CRUD operations.

    Attributes:
        session: The database session.
        _t: The database model type.
        _r: The read schema type.
        _c: The create schema type.
        _u: The update schema type.
    """
    _t: type[_T]
    _r: type[_R]
    _c: type[_C]
    _u: type[_U]

    def __init__(self, session: AsyncSession) -> None:
        """Initializes the service with a database session."""
        self.session: AsyncSession = session

    def __init_subclass__(cls, **kwargs: Any):
        super().__init_subclass__(**kwargs)
        orig_bases: list[Any] = getattr(cls, "__orig_bases__", [])
        for base in orig_bases:
            args: tuple[Any, ...] = get_args(base)
            if len(args) == 4:
                cls._t, cls._r, cls._c, cls._u = args
                break

    @overload
    def _return(self, item: _T, raw: Literal[False] = ...) -> _R | None: ...

    @overload
    def _return(self, item: _T, raw: Literal[True] = ...) -> _T | None: ...

    @overload
    def _return(self, item: _T, raw: bool = ...) -> _T | _R | None: ...

    def _return(self, item: _T, raw: bool = False) -> _T | _R | None:
        """Converts a database model to a schema or returns it raw."""
        if not item:
            return None
        return item if raw else self._r.model_validate(item)

    @overload
    def _return_many(self, items: list[_T], raw: Literal[False] = ...) -> list[_R]: ...

    @overload
    def _return_many(self, items: list[_T], raw: Literal[True] = ...) -> list[_T]: ...

    @overload
    def _return_many(self, items: list[_T], raw: bool = ...) -> list[_T] | list[_R]: ...

    def _return_many(self, items: list[_T], raw: bool = False) -> list[_T] | list[_R]:
        """Converts a list of database models to schemas or returns them raw."""
        if not items:
            return []
        return items if raw else [self._return(i) for i in items]

    @overload
    async def add(self, payload: _C, raw: Literal[True] = ...) -> _T: ...

    @overload
    async def add(self, payload: _C, raw: Literal[False] = ...) -> _R: ...

    @overload
    async def add(self, payload: _C, raw: bool = ...) -> _T | _R: ...

    @service_monitor
    async def add(self, payload: _C, raw: bool = False) -> _T | _R:
        """Adds a new entity to the database."""
        entity: _T = self._t(**payload.model_dump(exclude_unset=True))

        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)

        return self._return(entity, raw)

    @overload
    async def add_many(self, payloads: list[_C], raw: Literal[True] = ...) -> list[_T]: ...

    @overload
    async def add_many(self, payloads: list[_C], raw: Literal[False] = ...) -> list[_R]: ...

    @overload
    async def add_many(self, payloads: list[_C], raw: bool = False) -> list[_T] | list[_R]: ...

    @service_monitor
    async def add_many(self, payloads: list[_C], raw: bool = False) -> list[_T] | list[_R]:
        """Adds multiple entities to the database."""
        entities: list[_T] = [self._t(**p.model_dump()) for p in payloads]

        self.session.add_all(entities)
        await self.session.flush()

        return self._return_many(entities, raw)

    @overload
    async def get(self, id_: UUID, raw: Literal[False] = ...) -> _R: ...

    @overload
    async def get(self, id_: UUID, raw: Literal[True] = ...) -> _T: ...

    @overload
    async def get(self, id_: UUID, raw: bool = ...) -> _T | _R: ...

    @service_monitor
    async def get(self, id_: UUID, raw: bool = False) -> _T | _R:
        """Retrieves an entity by its ID."""
        result: _T | None = await self.session.get(self._t, id_)

        if not result:
            raise ResourceNotFoundError(self._t, id_)

        return self._return(result, raw)

    @overload
    async def get_many(self, ids: list[UUID], raw: Literal[False] = ...) -> list[_R]: ...

    @overload
    async def get_many(self, ids: list[UUID], raw: Literal[True] = ...) -> list[_T]: ...

    @overload
    async def get_many(self, ids: list[UUID], raw: bool = ...) -> list[_T] | list[_R]: ...

    @service_monitor
    async def get_many(self, ids: list[UUID], raw: bool = False) -> list[_T] | list[_R]:
        """Retrieves multiple entities by their IDs."""
        result = await self.session.execute(select(self._t).where(self._t.id.in_(ids)))

        entities = list(result.scalars().all())
        missing_ids = set(ids) - {e.id for e in entities}

        if missing_ids:
            raise ResourceNotFoundError(self._t, missing_ids)

        return self._return_many(entities, raw)

    @overload
    async def get_all(self, raw: Literal[False] = ...) -> list[_R]: ...

    @overload
    async def get_all(self, raw: Literal[True] = ...) -> list[_T]: ...

    @overload
    async def get_all(self, raw: bool = ...) -> list[_T] | list[_R]: ...

    @service_monitor
    async def get_all(self, raw: bool = False) -> list[_T] | list[_R]:
        """Retrieves all entities of the model type."""
        result: Result[tuple[Any, ...]] = await self.session.execute(select(self._t))
        return self._return_many(list(result.scalars().all()), raw)

    @overload
    async def update(self, payload: _U, raw: Literal[True] = ...) -> _T: ...

    @overload
    async def update(self, payload: _U, raw: Literal[False] = ...) -> _R: ...

    @overload
    async def update(self, payload: _U, raw: bool = ...) -> _T | _R: ...

    @service_monitor
    async def update(self, payload: _U, raw: bool = False) -> _T | _R:
        """Updates an existing entity."""
        entity: _T = await self.get(payload.id, raw=True)
        data: dict[str, Any] = payload.model_dump(exclude_unset=True)

        for key, value in data.items():
            setattr(entity, key, value)

        await self.session.flush()
        await self.session.refresh(entity)

        return self._return(entity, raw)

    @overload
    async def update_many(self, payloads: list[_U], raw: Literal[True] = ...) -> list[_T]: ...

    @overload
    async def update_many(self, payloads: list[_U], raw: Literal[False] = ...) -> list[_R]: ...

    @overload
    async def update_many(self, payloads: list[_U], raw: bool = ...) -> list[_T] | list[_R]: ...

    @service_monitor
    async def update_many(self, payloads: list[_U], raw: bool = False) -> list[_T] | list[_R]:
        """Updates multiple existing entities."""
        if not payloads:
            return []
        ids = [payload.id for payload in payloads]
        entities = await self.get_many(ids, raw=True)

        entities_map = {entity.id: entity for entity in entities}

        updated_entities: list[_T] = []
        for payload in payloads:
            entity: _T = entities_map[payload.id]
            data = payload.model_dump(exclude_unset=True)

            for key, value in data.items():
                setattr(entity, key, value)

            updated_entities.append(entity)

        await self.session.flush()
        return self._return_many(updated_entities, raw)

    @service_monitor
    async def delete(self, id_: UUID) -> UUID:
        """Deletes an entity by its ID."""
        entity: _T = await self.get(id_, raw=True)
        await self.session.delete(entity)
        await self.session.flush()
        return entity.id

    @service_monitor
    async def delete_many(self, ids: list[UUID]) -> list[UUID]:
        """Deletes multiple entities by their IDs."""
        result: Result[tuple[Any, ...]] = await self.session.execute(
            delete_(self._t)
            .where(self._t.id.in_(ids))
            .returning(self._t.id)
            .execution_options(synchronize_session="fetch")
        )
        return list(result.scalars().all())

    @service_monitor
    async def delete_all(self) -> list[UUID]:
        """Deletes all entities of the model type."""
        result: Result[tuple[Any, ...]] = await self.session.execute(
            delete_(self._t).returning(self._t.id).execution_options(synchronize_session="fetch")
        )
        return list(result.scalars().all())


class NodeService(BaseService[Node, NodeRead, NodeRead, NodeRead]):
    """
    Service for Node operations.

    Attributes:
        session: The database session (inherited).
        _t: Node model (inherited).
        _r: NodeRead schema (inherited).
        _c: NodeRead schema (inherited).
        _u: NodeRead schema (inherited).
    """
    ...


class EdgeService(BaseService[Edge, EdgeRead, EdgeRead, EdgeRead]):
    """
    Service for Edge operations.

    Attributes:
        session: The database session (inherited).
        _t: Edge model (inherited).
        _r: EdgeRead schema (inherited).
        _c: EdgeRead schema (inherited).
        _u: EdgeRead schema (inherited).
    """
    ...


class CanvasService:
    """
    Service for managing the entire canvas.

    Attributes:
        session: The database session.
        node_service: Service for node operations.
        edge_service: Service for edge operations.
    """
    def __init__(self, session: AsyncSession) -> None:
        """Initializes the service with a database session and sub-services."""
        self.session: AsyncSession = session
        self.node_service: NodeService = NodeService(session)
        self.edge_service: EdgeService = EdgeService(session)

    async def load_canvas(self) -> CanvasRead:
        """Loads all nodes and edges from the database."""
        async with asyncio.TaskGroup() as tg:
            node_task = tg.create_task(self.node_service.get_all(raw=False))
            edge_task = tg.create_task(self.edge_service.get_all(raw=False))

        return CanvasRead(nodes=node_task.result(), edges=edge_task.result())

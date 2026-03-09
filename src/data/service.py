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
from src.data.schemas import (
    CanvasRead,
    CreateBase,
    EdgeRead,
    NodeRead,
    ReadBase,
    UpdateBase,
)
from utils import service_monitor

if TYPE_CHECKING:
    from sqlalchemy.engine import Result


class ResourceNotFoundError(Exception):
    """Exception raised when a requested resource is not found."""

    ...


class InvalidUUIDError(Exception):
    """Exception raised when an invalid UUID is provided."""

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

    @service_monitor
    async def add(self, payload: _C) -> _T:
        """Adds a new entity to the database."""

        entity: _T = self._t(**payload.model_dump(exclude_unset=True))

        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)

        return entity

    @overload
    async def get(self, id_: UUID) -> _T: ...

    @overload
    async def get(self, id_: Literal["*"]) -> list[_T]: ...

    @service_monitor
    async def get(self, id_: UUID | Literal["*"]) -> _T | list[_T]:
        """Retrieves an entity by its ID."""
        if id_ == "*":
            result: Result[tuple[Any, ...]] = await self.session.execute(
                select(self._t)
            )
            return list(result.scalars().all())

        if not isinstance(id_, UUID):
            raise InvalidUUIDError(
                f"Invalid UUID format: {id_}. Expected a UUID or '*'."
            )

        result: _T | None = await self.session.get(self._t, id_)
        if not result:
            raise ResourceNotFoundError
        return result

    @service_monitor
    async def update(self, payload: _U) -> _T:
        """Updates an existing entity."""
        entity: _T = await self.get(payload.id)
        data: dict[str, Any] = payload.model_dump(exclude_unset=True)

        for key, value in data.items():
            setattr(entity, key, value)

        await self.session.flush()
        await self.session.refresh(entity)

        return entity

    @service_monitor
    async def delete(self, id_: UUID | Literal["*"]) -> UUID:
        """Deletes an entity by its ID."""

        if id_ == "*":
            result: Result[tuple[Any, ...]] = await self.session.execute(
                delete_(self._t)
                .returning(self._t.id)
                .execution_options(synchronize_session="fetch")
            )
            return list(result.scalars().all())

        if not isinstance(id_, UUID):
            raise InvalidUUIDError(
                f"Invalid UUID format: {id_}. Expected a UUID or '*'."
            )

        entity: _T = await self.get(id_)
        await self.session.delete(entity)
        await self.session.flush()
        return entity.id

    @service_monitor
    async def delete_all(self) -> list[UUID]:
        """Deletes all entities of the model type."""
        result: Result[tuple[Any, ...]] = await self.session.execute(
            delete_(self._t)
            .returning(self._t.id)
            .execution_options(synchronize_session="fetch")
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
            node_task = tg.create_task(self.node_service.get("*"))
            edge_task = tg.create_task(self.edge_service.get("*"))

        return CanvasRead.from_db(nodes=node_task.result(), edges=edge_task.result())

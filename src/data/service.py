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


class ResourceNotFoundError(Exception): ...


class InvalidUUIDError(Exception): ...


_T = TypeVar("_T", bound=Base)
_R = TypeVar("_R", bound=ReadBase)
_C = TypeVar("_C", bound=CreateBase)
_U = TypeVar("_U", bound=UpdateBase)


class BaseService[_T, _R, _C, _U]:
    _t: type[_T]
    _r: type[_R]
    _c: type[_C]
    _u: type[_U]

    def __init__(self, session: AsyncSession) -> None:
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
        entity: _T = await self.get(payload.id)
        data: dict[str, Any] = payload.model_dump(exclude_unset=True)

        for key, value in data.items():
            setattr(entity, key, value)

        await self.session.flush()
        await self.session.refresh(entity)

        return entity

    @service_monitor
    async def delete(self, id_: UUID | Literal["*"]) -> UUID:

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
        result: Result[tuple[Any, ...]] = await self.session.execute(
            delete_(self._t)
            .returning(self._t.id)
            .execution_options(synchronize_session="fetch")
        )
        return list(result.scalars().all())


class NodeService(BaseService[Node, NodeRead, NodeRead, NodeRead]): ...


class EdgeService(BaseService[Edge, EdgeRead, EdgeRead, EdgeRead]): ...


class CanvasService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session
        self.node_service: NodeService = NodeService(session)
        self.edge_service: EdgeService = EdgeService(session)

    async def load_canvas(self) -> CanvasRead:
        async with asyncio.TaskGroup() as tg:
            node_task = tg.create_task(self.node_service.get("*"))
            edge_task = tg.create_task(self.edge_service.get("*"))

        return CanvasRead.from_db(nodes=node_task.result(), edges=edge_task.result())

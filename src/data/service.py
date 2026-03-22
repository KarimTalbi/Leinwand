import asyncio
from typing import (
    TYPE_CHECKING,
    Any,
    TypeVar,
)

from sqlalchemy import delete as delete_
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.db_models import Edge, Node
from src.data.schemas import (
    CanvasCreate,
    CanvasRead,
    ConfRes,
    EdgeCreate,
    EdgeRead,
    NodeCreate,
    NodeRead,
)
from src.data.types import ModelT, SchemaT

if TYPE_CHECKING:
    from sqlalchemy.engine import Result


class ResourceNotFoundError(Exception): ...


class InvalidUUIDError(Exception): ...


_T = TypeVar("_T", bound=ModelT)
_R = TypeVar("_R", bound=SchemaT)
_C = TypeVar("_C", bound=SchemaT)


class BaseService[_T, _R, _C]:
    def __init__(
        self,
        session: AsyncSession,
        model: type[_T],
        read_schema: type[_R],
    ) -> None:
        self.session: AsyncSession = session
        self._t: type[_T] = model
        self._r: type[_R] = read_schema

    async def get(self) -> list[_T]:
        result: Result[tuple[Any, ...]] = await self.session.execute(select(self._t))
        return list(result.scalars().all())

    async def delete(self) -> ConfRes:
        result: Result[tuple[Any, ...]] = await self.session.execute(
            delete_(self._t).returning(self._t.id)
        )
        return ConfRes(message="Deleted successfully", id=result.scalars().all())

    async def create(self, payload: list[_C]) -> ConfRes:
        await self.session.execute(insert(self._t), [p.model_dump() for p in payload])
        return ConfRes(message="Created successfully", id=[p.id for p in payload])


class NodeService(BaseService[Node, NodeRead, NodeCreate]):
    def __init__(self, session: AsyncSession):
        super().__init__(session=session, model=Node, read_schema=NodeRead)


class EdgeService(BaseService[Edge, EdgeRead, EdgeCreate]):
    def __init__(self, session: AsyncSession):
        super().__init__(session=session, model=Edge, read_schema=EdgeRead)


class CanvasService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session
        self.node_service: NodeService = NodeService(session)
        self.edge_service: EdgeService = EdgeService(session)

    async def load(self) -> CanvasRead:
        async with asyncio.TaskGroup() as tg:
            node_task = tg.create_task(self.node_service.get())
            edge_task = tg.create_task(self.edge_service.get())

        return CanvasRead(
            nodes=[NodeRead.model_validate(n) for n in node_task.result()],
            edges=[EdgeRead.model_validate(e) for e in edge_task.result()],
        )

    async def wipe(self):
        async with asyncio.TaskGroup() as tg:
            tg.create_task(self.edge_service.delete())
            tg.create_task(self.node_service.delete())

        return ConfRes(message="Wiped successfully", id="*")

    async def save(self, canvas: CanvasCreate) -> ConfRes:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(self.node_service.create(canvas.nodes))
            tg.create_task(self.edge_service.create(canvas.edges))

        return ConfRes(message="Saved successfully", id="*")

    async def sync(self, canvas: CanvasCreate) -> ConfRes:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(self.wipe())
            tg.create_task(self.save(canvas))

        return ConfRes(message="Synced successfully", id="*")

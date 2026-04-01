import json
from typing import Any, TypeVar
from uuid import UUID

from sqlalchemy import delete, select, text
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.db_models import Edge, Node
from src.data.queries.load_query import get_text_clause
from src.data.schemas import (
    AncestorNode,
    AncestorResponse,
    CanvasCreate,
    CanvasRead,
    ConfRes,
    EdgeCreate,
    EdgeRead,
    NodeCreate,
    NodeRead,
)
from src.data.types import ModelT, QueryType, SchemaT
from utils import get_rows, service_monitor

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

    @service_monitor
    async def get(self) -> list[_T]:
        result = await self.session.execute(select(self._t))
        return list(result.scalars().all())

    @service_monitor
    async def get_by_id(self, id_: UUID) -> _T:
        return await self.session.get(self._t, id_)

    @service_monitor
    async def clear(self) -> ConfRes:
        result = await self.session.execute(delete(self._t).returning(self._t.id))
        return ConfRes(message="Deleted successfully", id=result.scalars().all())

    @service_monitor
    async def create(self, payload: list[_C]) -> ConfRes:
        await self.session.execute(insert(self._t), [p.model_dump() for p in payload])
        return ConfRes(message="Created successfully", id=[p.id for p in payload])


class NodeService(BaseService[Node, NodeRead, NodeCreate]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Node, NodeRead)

    async def update(self, payload) -> NodeRead:
        entity = self.session.get(self._t, payload.id)

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(entity, key, value)

        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return self._r.model_validate(entity)

    async def ancestors(self, node_id: UUID, target_handle: str | None = None) -> AncestorResponse:
        print("getting ancestors")
        query = get_text_clause(
            QueryType.ANCESTORS, {"node_id": str(node_id), "target_handle": target_handle}
        )

        result = await self.session.execute(query)
        print(result)

        print("got ancestors")

        rows = get_rows(result)
        nodes = [AncestorNode(**r) for r in rows]

        return AncestorResponse(
            node_id=node_id,
            target_handle=target_handle,
            total=len(nodes),
            ancestors=nodes,
        )


class EdgeService(BaseService[Edge, EdgeRead, EdgeCreate]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Edge, EdgeRead)


class CanvasService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session
        self.node_service: NodeService = NodeService(session)
        self.edge_service: EdgeService = EdgeService(session)

    async def load(self) -> CanvasRead:
        nodes = await self.node_service.get()
        edges = await self.edge_service.get()

        return CanvasRead(
            nodes=[NodeRead.model_validate(n) for n in nodes],
            edges=[EdgeRead.model_validate(e) for e in edges],
        )

    async def wipe(self):
        await self.edge_service.clear()
        await self.node_service.clear()

        return ConfRes(message="Wiped successfully")

    async def save(self, canvas: CanvasCreate) -> ConfRes:
        if canvas.nodes:
            await self.node_service.create(canvas.nodes)
        if canvas.edges:
            await self.edge_service.create(canvas.edges)

        return ConfRes(message="Saved successfully")

    async def sync(self, canvas: CanvasCreate) -> ConfRes:
        await self.wipe()
        await self.save(canvas)

        return ConfRes(message="Synced successfully")

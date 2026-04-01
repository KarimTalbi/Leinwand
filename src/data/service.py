import json
from typing import Any, TypeVar
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.db_models import Edge, Node
from src.data.queries.load_query import load_query
from src.data.schemas import (
    CanvasCreate,
    CanvasRead,
    ConfRes,
    EdgeCreate,
    EdgeRead,
    NodeCreate,
    NodeRead,
)
from src.data.types import ModelT, QueryType, SchemaT
from utils import service_monitor

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

    async def ancestors(
        self, node_id: UUID, source_handle: str | None = None
    ) -> list[dict[str, Any]]:
        result = await self.session.execute(
            load_query(QueryType.ANCESTORS),
            {
                "node_id": node_id,
                "source_handle": source_handle,
            },
        )

        rows = []
        for row in result.mappings():
            r = dict(row)
            r["position"] = (
                json.loads(r["position"]) if isinstance(r["position"], str) else r["position"]
            )
            r["data"] = json.loads(r["data"]) if isinstance(r["data"], str) else r["data"]
            rows.append(r)

        return rows


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

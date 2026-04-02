from typing import Literal, TypeVar, overload

from sqlalchemy import delete, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.db_models import Edge, Node
from src.data.queries.load_query import get_text_clause
from src.data.schemas import (
    AncestorNode,
    AncestorResponse,
    CanvasRead,
    Confirmation,
    EdgeRead,
    NodeRead,
)
from src.data.types_ import ModelT, QueryType, SchemaT
from utils import get_rows, service_monitor

_T = TypeVar("_T", bound=ModelT)
_R = TypeVar("_R", bound=SchemaT)


class BaseService[_T, _R]:
    def __init__(
        self,
        session: AsyncSession,
        model: type[_T],
        read_schema: type[_R],
    ) -> None:

        self.session: AsyncSession = session
        self._model: type[_T] = model
        self._read: type[_R] = read_schema

    @overload
    async def get(self, id_: str = ..., raw: Literal[False] = ...) -> _R: ...

    @overload
    async def get(self, id_: str = ..., raw: Literal[True] = ...) -> _T: ...

    @overload
    async def get(
        self, id_: Literal["*"] = ..., raw: Literal[False] = ...
    ) -> list[_R]: ...

    @overload
    async def get(
        self, id_: Literal["*"] = ..., raw: Literal[True] = ...
    ) -> list[_T]: ...

    @service_monitor
    async def get(
        self, id_: str | Literal["*"] = "*", raw: bool = False
    ) -> _T | _R | list[_T] | list[_R]:

        if id_ == "*":
            result = await self.session.execute(select(self._model))
            return (
                list(result.scalars().all())
                if raw
                else [self._read.model_validate(r) for r in result.scalars().all()]
            )

        result = await self.session.get(self._model, id_)
        return result if raw else self._read.model_validate(result)

    @service_monitor
    async def clear(self) -> Confirmation:
        await self.session.execute(delete(self._model))
        return Confirmation(message="Deleted successfully")

    @service_monitor
    async def write(self, payload: list[_R]) -> Confirmation:
        await self.session.execute(
            insert(self._model), [p.model_dump() for p in payload]
        )
        return Confirmation(message="Created successfully")


class NodeService(BaseService[Node, NodeRead]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Node, NodeRead)

    @overload
    async def update(self, payload: NodeRead, raw: Literal[False] = ...) -> Node: ...

    @overload
    async def update(self, payload: NodeRead, raw: Literal[True] = ...) -> NodeRead: ...

    async def update(self, payload, raw: bool = False) -> Node | NodeRead:
        entity = self.session.get(self._model, payload.id)

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(entity, key, value)

        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)

        return entity if raw else self._read.model_validate(entity)

    async def ancestors(
        self, node_id: str, target_handle: str | None = None
    ) -> AncestorResponse:
        query = get_text_clause(
            QueryType.ANCESTORS,
            {"node_id": str(node_id), "target_handle": target_handle},
        )

        result = await self.session.execute(query)

        rows = get_rows(result)
        nodes = [AncestorNode(**r) for r in rows]

        return AncestorResponse(
            node_id=node_id,
            target_handle=target_handle,
            total=len(nodes),
            ancestors=nodes,
        )


class EdgeService(BaseService[Edge, EdgeRead]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Edge, EdgeRead)


class CanvasService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session
        self.node_service: NodeService = NodeService(session)
        self.edge_service: EdgeService = EdgeService(session)

    async def load(self) -> CanvasRead:
        nodes = await self.node_service.get("*", raw=False)
        edges = await self.edge_service.get("*", raw=False)

        return CanvasRead(nodes=nodes, edges=edges)

    async def wipe(self) -> Confirmation:
        await self.edge_service.clear()
        await self.node_service.clear()

        return Confirmation(message="Wiped successfully")

    async def save(self, canvas: CanvasRead) -> Confirmation:
        if canvas.nodes:
            await self.node_service.write(canvas.nodes)
        if canvas.edges:
            await self.edge_service.write(canvas.edges)

        return Confirmation(message="Saved successfully")

    async def sync(self, canvas: CanvasRead) -> Confirmation:
        await self.wipe()
        await self.save(canvas)

        return Confirmation(message="Synced successfully")

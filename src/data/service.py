from sqlalchemy import delete, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.db_models import Edge, Node
from src.data.queries.load_query import get_ancestors
from src.data.schemas import (
    AncestorNode,
    AncestorResponse,
    Confirmation,
    EdgeRead,
    NodeRead,
)
from utils import get_rows, service_monitor


class BaseService[_T, _R]:
    def __init__(
        self, session: AsyncSession, model: type[_T], schema: type[_R]
    ) -> None:
        self.session: AsyncSession = session
        self._model: type[_T] = model
        self._read: type[_R] = schema

    @service_monitor
    async def get_by_id(self, id_: str) -> _T:
        entity = await self.session.get(self._model, id_)

        if not entity:
            raise ValueError(f"Entity with id {id_} not found")

        return entity

    @service_monitor
    async def get(self) -> list[_T]:
        return await self.session.execute(select(self._model))

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

    @service_monitor
    async def ancestors(
        self, node_id: str, handle: str | None = None
    ) -> AncestorResponse:

        query = get_ancestors(node_id, handle)
        result = await self.session.execute(query)
        rows = get_rows(result)
        nodes = [AncestorNode(**r) for r in rows]

        ancestor_response = AncestorResponse(
            node_id=node_id,
            source_handle=handle,
            total=len(nodes),
            ancestors=nodes,
        )

        return ancestor_response


class EdgeService(BaseService[Edge, EdgeRead]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Edge, EdgeRead)

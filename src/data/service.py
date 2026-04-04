from sqlalchemy import delete, select
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.data.db_models import Node, Edge
from src.data.queries.load_query import get_ancestors
from src.data.schemas import (
    AncestorNode,
    AncestorResponse,
    NodeRead,
    EdgeRead,
    CanvasRead,
)

from utils import get_rows


class CanvasService:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    # --- Nodes ---

    async def get_nodes(self) -> list[Node]:
        result = await self.session.execute(select(Node))
        return list(result.scalars().all())

    async def get_node_by_id(self, node_id: str) -> Node:
        node = await self.session.get(Node, node_id)

        if not node:
            raise ValueError(f"Node with id {node_id} not found")

        return node

    async def write_nodes(self, nodes: list[NodeRead]) -> None:
        if not nodes:
            return
        await self.session.execute(
            insert(Node),
            [
                n.model_dump(by_alias=True, exclude_unset=True, exclude_none=True)
                for n in nodes
            ],
        )

    async def clear_nodes(self) -> None:
        await self.session.execute(delete(Node))

    async def get_ancestors(
        self, node_id: str, handle: str | None = None
    ) -> list[AncestorResponse]:
        result = await self.session.execute(get_ancestors(node_id, handle))
        rows = get_rows(result)
        nodes = [AncestorNode(**r) for r in rows]

        ancestor_response = AncestorResponse(
            node_id=node_id,
            source_handle=handle,
            total=len(nodes),
            ancestors=nodes,
        )
        return ancestor_response

    # --- Edges ---

    async def get_edges(self) -> list[Edge]:
        result = await self.session.execute(select(Edge))
        return list(result.scalars().all())

    async def write_edges(self, edges: list[EdgeRead]) -> None:
        if not edges:
            return
        await self.session.execute(
            insert(Node),
            [
                n.model_dump(by_alias=True, exclude_unset=True, exclude_none=True)
                for n in edges
            ],
        )

    async def clear_edges(self) -> None:
        await self.session.execute(delete(Edge))

    # --- Canvas ---

    async def load_canvas(self) -> CanvasRead:
        nodes_db = await self.get_nodes()
        edges_db = await self.get_edges()

        nodes_read = [NodeRead.model_validate(node) for node in nodes_db]
        edges_read = [EdgeRead.model_validate(edge) for edge in edges_db]

        return CanvasRead(nodes=nodes_read, edges=edges_read)

    async def wipe_canvas(self):
        await self.clear_edges()
        await self.clear_nodes()

    async def write_canvas(self, canvas: CanvasRead):
        if canvas.nodes:
            await self.write_nodes(canvas.nodes)
            if canvas.edges:
                await self.write_edges(canvas.edges)

    async def sync_canvas(self, canvas: CanvasRead):
        await self.wipe_canvas()
        await self.write_canvas(canvas)

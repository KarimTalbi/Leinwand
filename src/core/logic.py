from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasRead, Edge, EdgeRead, Node, NodeRead, service


async def load_canvas(session: AsyncSession) -> CanvasRead:
    nodes: list[Node] = await service.get(session, Node, "*")
    edges: list[Edge] = await service.get(session, Edge, "*")
    return CanvasRead(
        nodes=[NodeRead.model_validate(node) for node in nodes],
        edges=[EdgeRead.model_validate(edge) for edge in edges],
    )

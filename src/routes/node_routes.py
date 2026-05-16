from typing import Annotated, Any, Protocol

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import (
    Edge,
    EdgeRead,
    LoadDataResponse,
    Node,
    NodeRead,
    UserAuth,
    get_async_session,
)
from service import get_current_active_user, node_service as ns


class LLMResponse(Protocol):
    response: str
    has_issues: bool | None


node_router = APIRouter(prefix="/node", tags=["node"])


@node_router.get("/list/{canvas_id}/", response_model=LoadDataResponse)
async def get_data(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:

    nodes: list[Node] = await ns.list_nodes(session, current_user.id, canvas_id)
    edges: list[Edge] = await ns.list_edges(session, current_user.id, canvas_id)

    nodes_read: list[NodeRead] = [NodeRead.model_validate(node) for node in nodes]
    edges_read: list[EdgeRead] = [EdgeRead.model_validate(edge) for edge in edges]

    return LoadDataResponse(nodes=nodes_read, edges=edges_read)


@node_router.post("/sync/{canvas_id}/")
async def sync_data(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    data: LoadDataResponse,
    session: AsyncSession = Depends(get_async_session),
) -> None:

    await ns.delete_all_edges(session, current_user.id, canvas_id)
    await session.flush()
    await ns.delete_all_nodes(session, current_user.id, canvas_id)
    await session.flush()

    await ns.write_nodes(session, data.nodes, current_user.id, canvas_id)
    await ns.write_edges(session, data.edges, current_user.id, canvas_id)


from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import (
    Edge,
    EdgeRead,
    Node,
    NodeRead,
    UserAuth,
    get_async_session,
    SyncDataRequest,
    SyncDataResponse,
)
from service import get_current_active_user, node_service as ns, canvas_service as cs


node_router = APIRouter(prefix="/node", tags=["node"])


@node_router.get("/list/{canvas_id}/")
async def get_data(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> SyncDataResponse:

    nodes: list[Node] = await ns.list_nodes(session, current_user.id, canvas_id)
    edges: list[Edge] = await ns.list_edges(session, current_user.id, canvas_id)

    nodes_read: list[NodeRead] = [NodeRead.model_validate(node) for node in nodes]
    edges_read: list[EdgeRead] = [EdgeRead.model_validate(edge) for edge in edges]

    return SyncDataResponse(nodes=nodes_read, edges=edges_read)


@node_router.post("/sync/{canvas_id}/")
async def sync_data(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    data: SyncDataRequest,
    session: AsyncSession = Depends(get_async_session),
) -> None:

    await ns.delete_all_edges(session, current_user.id, canvas_id)
    await ns.delete_all_nodes(session, current_user.id, canvas_id)

    await ns.write_nodes(session, data.nodes, current_user.id, canvas_id)
    await ns.write_edges(session, data.edges, current_user.id, canvas_id)

    await cs.update_canvas_data(session, canvas_id, data.time)

"""
This module defines the API routes for managing nodes and edges within a canvas.

It provides endpoints for:
- Retrieving all nodes and edges for a specific canvas.
- Synchronizing the state of a canvas by replacing all existing nodes and edges
  with a newly provided set.

The routes handle authentication and database session management using dependencies.
"""
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
    """
    Retrieves all nodes and edges associated with a specific canvas.

    Args:
        current_user: The authenticated user making the request.
        canvas_id: The unique identifier of the canvas to query.
        session: The database session.

    Returns:
        A SyncDataResponse containing lists of nodes and edges.
    """
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
    """
    Synchronizes the nodes and edges for a specific canvas.

    This endpoint performs a full synchronization by first deleting all existing
    nodes and edges for the canvas, and then writing the new set of nodes and
    edges provided in the request payload. It also updates the canvas's last
    modified time.

    Args:
        current_user: The authenticated user making the request.
        canvas_id: The unique identifier of the canvas to sync.
        data: The synchronization request payload containing the new nodes, edges, and timestamp.
        session: The database session.
    """
    await ns.delete_all_edges(session, current_user.id, canvas_id)
    await ns.delete_all_nodes(session, current_user.id, canvas_id)

    await ns.write_nodes(session, data.nodes, current_user.id, canvas_id)
    await ns.write_edges(session, data.edges, current_user.id, canvas_id)

    await cs.update_canvas_data(session, canvas_id, data.time)

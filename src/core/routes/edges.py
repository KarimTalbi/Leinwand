"""
API endpoints for edge-related operations.
"""
from uuid import UUID

from fastapi import APIRouter, Depends

from data import DeleteResponse, EdgeCreate, EdgeRead, EdgeService
from src.core.dependencies import get_edge_service

edge_router = APIRouter(prefix="/edges", tags=["Edges"])


@edge_router.post("/")
async def create_edge(
    payload: EdgeCreate, service: EdgeService = Depends(get_edge_service)
) -> EdgeRead:
    """
    Creates a new edge.

    Args:
        payload: The data for creating an edge.
        service: The edge service (injected).

    Returns:
        The created edge.
    """
    return await service.add(payload)


@edge_router.delete("/")
async def delete_edge(
    edge_id: UUID, service: EdgeService = Depends(get_edge_service)
) -> DeleteResponse:
    """
    Deletes an edge by its ID.

    Args:
        edge_id: The unique identifier of the edge.
        service: The edge service (injected).

    Returns:
        A confirmation of the deletion.
    """
    deleted_id = await service.delete(edge_id)
    return DeleteResponse(message="Edge deleted successfully", id=deleted_id)

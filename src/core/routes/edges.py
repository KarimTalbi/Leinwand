"""
API endpoints for edge-related operations.
"""

from uuid import UUID

from fastapi import APIRouter, Depends

from data import DeleteResponse, EdgeCreate, EdgeRead, EdgeService
from src.core.dependencies import get_edge_service

edge_router = APIRouter(prefix="/edges", tags=["Edges"])


@edge_router.post("")
async def create_edge(
    payload: EdgeCreate, service: EdgeService = Depends(get_edge_service)
) -> EdgeRead:
    return await service.add(payload)


@edge_router.delete("")
async def delete_edge(
    edge_id: UUID, service: EdgeService = Depends(get_edge_service)
) -> DeleteResponse:
    deleted_id = await service.delete(edge_id)
    return DeleteResponse(message="Edge deleted successfully", id=deleted_id)

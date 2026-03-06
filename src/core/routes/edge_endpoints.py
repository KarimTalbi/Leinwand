from uuid import UUID

from fastapi import APIRouter, Depends

from src.core.dependencies import get_edge_service
from data import DeleteResponse, EdgeCreate, EdgeRead, EdgeService

edge_router = APIRouter(prefix="/edges", tags=["Edges"])


@edge_router.post("/")
async def create_edge(
    payload: EdgeCreate, service: EdgeService = Depends(get_edge_service)
) -> EdgeRead:
    """
    Asynchronous function to create and return a new edge entry by processing the payload
    data through the provided service.

    Args:
        payload (EdgeCreate): The input data for creating an edge.
        service (EdgeService): The service instance responsible for adding the edge.
            It is injected using a dependency.

    Returns:
        EdgeRead: The newly created edge entity represented in a read model.
    """
    return await service.add(payload)


@edge_router.delete("/")
async def delete_edge(
    edge_id: UUID, service: EdgeService = Depends(get_edge_service)
) -> DeleteResponse:
    """
    Deletes an edge from the system using the specified edge ID.

    This function handles the deletion of an edge based on the given UUID. The
    service dependency is used to call the appropriate method for executing the
    deletion logic, and a response is returned confirming the deletion.

    Args:
        edge_id (UUID): The unique identifier of the edge to be deleted.
        service (EdgeService): Dependency-injected service used for edge
            operations.

    Returns:
        DeleteResponse: A response object containing a confirmation message and
        the ID of the deleted edge.
    """
    deleted_id = await service.delete(edge_id)
    return DeleteResponse(message="Edge deleted successfully", id=deleted_id)

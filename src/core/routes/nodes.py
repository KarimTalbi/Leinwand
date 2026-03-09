"""
API endpoints for node-related operations.
"""
from uuid import UUID

from fastapi import APIRouter, Depends

from data import DeleteResponse, NodeCreate, NodeRead, NodeService, NodeUpdate
from src.core.dependencies import get_node_service

node_router = APIRouter(prefix="/nodes", tags=["Nodes"])


@node_router.post("/")
async def create_node(
    payload: NodeCreate, service: NodeService = Depends(get_node_service)
) -> NodeRead:
    """
    Creates a new node.

    Args:
        payload: The data for creating a node.
        service: The node service (injected).

    Returns:
        The created node.
    """
    return await service.add(payload)


@node_router.get("/{node_id}")
async def get_node(node_id: UUID, service: NodeService = Depends(get_node_service)) -> NodeRead:
    """
    Retrieves a node by its ID.

    Args:
        node_id: The unique identifier of the node.
        service: The node service (injected).

    Returns:
        The requested node.
    """
    return await service.get(node_id)


@node_router.patch("/")
async def update_node(
    payload: NodeUpdate, service: NodeService = Depends(get_node_service)
) -> NodeRead:
    """
    Updates an existing node.

    Args:
        payload: The data for updating a node.
        service: The node service (injected).

    Returns:
        The updated node.
    """
    return await service.update(payload)


@node_router.delete("/{node_id}")
async def delete_node(
    node_id: UUID, service: NodeService = Depends(get_node_service)
) -> DeleteResponse:
    """
    Deletes a node by its ID.

    Args:
        node_id: The unique identifier of the node.
        service: The node service (injected).

    Returns:
        A confirmation of the deletion.
    """
    deleted_id = await service.delete(node_id)
    return DeleteResponse(message="Node deleted successfully", id=deleted_id)

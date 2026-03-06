from uuid import UUID

from fastapi import APIRouter, Depends

from src.core.dependencies import get_node_service
from data import NodeCreate, NodeRead, NodeUpdate, NodeService, DeleteResponse

node_router = APIRouter(prefix="/nodes", tags=["Nodes"])


@node_router.post("/")
async def create_node(
    payload: NodeCreate, service: NodeService = Depends(get_node_service)
) -> NodeRead:
    """
    Handles the creation of a new node resource.

    Args:
        payload: The input data required to initialize a new node.
        service: Dependency-injected service instance for managing node operations.

    Returns:
        NodeRead: The data representation of the newly created node.
    """
    return await service.add(payload)


@node_router.get("/{node_id}")
async def get_node(node_id: UUID, service: NodeService = Depends(get_node_service)) -> NodeRead:
    """
    Handles retrieval of a node by its ID.

    Args:
        node_id: The unique identifier of the node.
        service: Dependency-injected service instance for managing node operations.

    Returns:
        NodeRead: Object containing details of the requested node.
    """
    return await service.get(node_id)


@node_router.patch("/")
async def update_node(
    payload: NodeUpdate, service: NodeService = Depends(get_node_service)
) -> NodeRead:
    """
    Updates an existing node's data based on the provided payload.

    Args:
        payload: The input data including the updated details of the node.
        service: Dependency-injected service instance for managing node operations.

    Returns:
        NodeRead: Object containing the updated details of the node.
    """
    return await service.update(payload)


@node_router.delete("/{node_id}")
async def delete_node(
    node_id: UUID, service: NodeService = Depends(get_node_service)
) -> DeleteResponse:
    """
    Deletes a node from the system.

    Args:
        node_id: The unique identifier of the node.
        service: Dependency-injected service instance for managing node operations.

    Returns:
        DeleteResponse: Object containing a confirmation message and the ID of the deleted node.
    """
    deleted_id = await service.delete(node_id)
    return DeleteResponse(message="Node deleted successfully", id=deleted_id)

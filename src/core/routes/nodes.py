from uuid import UUID

from fastapi import APIRouter, Depends

from data import DeleteResponse, NodeCreate, NodeRead, NodeService, NodeUpdate
from src.core.dependencies import get_node_service

node_router = APIRouter(prefix="/nodes", tags=["Nodes"])


@node_router.post("")
async def create_node(
    payload: NodeCreate, service: NodeService = Depends(get_node_service)
) -> NodeRead:
    return await service.add(payload)


@node_router.get("")
async def get_node(
    node_id: UUID, service: NodeService = Depends(get_node_service)
) -> NodeRead:
    return await service.get(node_id)


@node_router.patch("")
async def update_node(
    payload: NodeUpdate, service: NodeService = Depends(get_node_service)
) -> NodeRead:
    return await service.update(payload)


@node_router.delete("")
async def delete_node(
    node_id: UUID, service: NodeService = Depends(get_node_service)
) -> DeleteResponse:
    deleted_id = await service.delete(node_id)
    return DeleteResponse(message="Node deleted successfully", id=deleted_id)

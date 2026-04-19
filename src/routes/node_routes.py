from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

node_router = APIRouter(prefix="/node", tags=["node"])

from service import node_service as ns, get_current_active_user
from data import (
    get_async_session,
    UserAuth,
    NodeRead,
    NodeCreate,
    NodeUpdate,
    MergeResponse,
)


@node_router.get("/list/{canvas_id}/")
async def get_nodes(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> list[NodeRead]:
    return await ns.list_nodes(session, current_user.id, UUID(canvas_id))


@node_router.get("/{node_id}")
async def get_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> NodeRead:
    return await ns.get_node(session, UUID(node_id), current_user.id)


@node_router.post("/create/{canvas_id}/")
async def create_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    node_create: NodeCreate,
    session: AsyncSession = Depends(get_async_session),
) -> NodeRead:
    return await ns.create_node(session, node_create, UUID(canvas_id), current_user.id)


@node_router.delete("/{node_id}/delete/")
async def delete_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> UUID:
    return await ns.delete_node(session, node_id, current_user.id)


@node_router.put("/{node_id}/update/")
async def update_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    node_update: NodeUpdate,
    session: AsyncSession = Depends(get_async_session),
) -> NodeRead:
    return await ns.update_node(session, node_id, node_update, current_user.id)


@node_router.get("/{node_id}/ancestors/")
async def get_ancestors(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    node_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> MergeResponse:
    result = await ns.get_ancestors(session, UUID(node_id), current_user.id)
    return MergeResponse(response=result)

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import UserAuth, get_async_session, EdgeRead, EdgeCreate
from service import get_current_active_user, edge_service as es

edge_router = APIRouter(prefix="/edge", tags=["edge"])


@edge_router.get("/list/{canvas_id}/")
async def get_edges(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> list[EdgeRead]:
    return await es.list_edges(session, current_user.id, UUID(canvas_id))


@edge_router.get("/{edge_id}")
async def get_edge(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    edge_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> EdgeRead:
    return await es.get_edge(session, UUID(edge_id), current_user.id)


@edge_router.post("/create/{canvas_id}/")
async def create_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    edge_create: EdgeCreate,
    session: AsyncSession = Depends(get_async_session),
) -> EdgeRead:
    return await es.create_edge(session, edge_create, UUID(canvas_id), current_user.id)


@edge_router.delete("/{edge_id}/delete/")
async def delete_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    edge_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> UUID:
    return await es.delete_edge(session, edge_id, current_user.id)

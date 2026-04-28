from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import EdgeCreate, EdgeRead, UserAuth, get_async_session
from service import edge_service as es
from service import get_current_active_user

edge_router = APIRouter(prefix="/edge", tags=["edge"])


@edge_router.get("/list/{canvas_id}/", response_model=list[EdgeRead])
async def get_edges(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await es.list_edges(session, current_user.id, UUID(canvas_id))


@edge_router.get("/{edge_id}", response_model=EdgeRead)
async def get_edge(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    edge_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await es.get_edge(session, UUID(edge_id), current_user.id)


@edge_router.post("/create/{canvas_id}/", response_model=EdgeRead)
async def create_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    edge_create: EdgeCreate,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await es.create_edge(session, edge_create, UUID(canvas_id), current_user.id)


@edge_router.delete("/{edge_id}/delete/")
async def delete_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    edge_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> UUID:
    return await es.delete_edge(session, UUID(edge_id), current_user.id)

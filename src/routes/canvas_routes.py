from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import UserAuth, get_async_session, CanvasRead, CanvasCreate, CanvasUpdate
from service import get_current_active_user, canvas_service as cs

canvas_router = APIRouter(prefix="/canvas", tags=["canvas"])


@canvas_router.get("/list/")
async def get_canvases(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    session: AsyncSession = Depends(get_async_session),
) -> list[CanvasRead]:
    return await cs.list_canvases(session, current_user.id)


@canvas_router.get("/{canvas_id}")
async def get_canvas(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> CanvasRead:
    return await cs.get_canvas(session, UUID(canvas_id), current_user.id)


@canvas_router.post("/create/")
async def create_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_create: CanvasCreate,
    session: AsyncSession = Depends(get_async_session),
) -> CanvasRead:
    return await cs.create_canvas(session, canvas_create, current_user.id)


@canvas_router.delete("/{canvas_id}/delete/")
async def delete_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> UUID:
    return await cs.delete_canvas(session, canvas_id, current_user.id)


@canvas_router.put("/{canvas_id}/update/")
async def update_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    canvas_update: CanvasUpdate,
    session: AsyncSession = Depends(get_async_session),
) -> CanvasRead:
    return await cs.update_canvas(session, canvas_update, canvas_id, current_user.id)

from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasCreate, CanvasRead, CanvasUpdate, UserAuth, get_async_session
from service import canvas_service as cs
from service import get_current_active_user

canvas_router = APIRouter(prefix="/canvas", tags=["canvas"])


@canvas_router.get("/list/", response_model=list[CanvasRead])
async def get_canvases(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await cs.list_canvases(session, current_user.id)


@canvas_router.get("/{canvas_id}", response_model=CanvasRead)
async def get_canvas(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await cs.get_canvas(session, UUID(canvas_id), current_user.id)


@canvas_router.post("/create/", response_model=CanvasRead)
async def create_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_create: CanvasCreate,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await cs.create_canvas(session, canvas_create, current_user.id)


@canvas_router.delete("/{canvas_id}/delete/")
async def delete_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> UUID:
    return await cs.delete_canvas(session, UUID(canvas_id), current_user.id)


@canvas_router.put("/{canvas_id}/update/", response_model=CanvasRead)
async def update_node(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    canvas_update: CanvasUpdate,
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await cs.update_canvas(session, canvas_update, UUID(canvas_id), current_user.id)

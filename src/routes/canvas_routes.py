from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasRead, UserAuth, get_async_session
from service import canvas_service as cs
from service import get_current_active_user

canvas_router = APIRouter(prefix="/canvas", tags=["canvas"])


@canvas_router.get("/list/", response_model=list[CanvasRead])
async def get_canvases(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    return await cs.list_canvases(session, current_user.id)


@canvas_router.post("/create/")
async def create_canvas(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_create: CanvasRead,
    session: AsyncSession = Depends(get_async_session),
) -> None:
    await cs.create_canvas(session, canvas_create, current_user.id)


@canvas_router.delete("/{canvas_id}/delete/")
async def delete_canvas(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    canvas_id: str,
    session: AsyncSession = Depends(get_async_session),
) -> None:
    await cs.delete_canvas(session, canvas_id, current_user.id)

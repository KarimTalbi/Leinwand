from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import (
    Canvas,
    CanvasRead,
    CanvasUpdateRequest,
    Edge,
    EdgeRead,
    Node,
    NodeRead,
    UserAuth,
    get_async_session,
)
from service import canvas_service as cs
from service import get_current_active_user
from service import node_service as ns

canvas_router = APIRouter(prefix="/canvas", tags=["canvas"])


@canvas_router.get("/list/", response_model=list[CanvasRead])
async def get_canvases(
    current_user: Annotated[UserAuth, Depends(get_current_active_user)],
    session: AsyncSession = Depends(get_async_session),
) -> Any:
    canvases: list[Canvas] = await cs.list_canvases(session, current_user.id)

    for canvas in canvases:
        nodes: list[Node] = await ns.list_nodes(session, current_user.id, canvas.id)
        edges: list[Edge] = await ns.list_edges(session, current_user.id, canvas.id)
        canvas.data = {
            **canvas.data,
            "nodes": [NodeRead.model_validate(n).model_dump() for n in nodes],
            "edges": [EdgeRead.model_validate(e).model_dump() for e in edges],
        }

    return canvases


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
    await ns.delete_all_edges(session, current_user.id, canvas_id)
    await ns.delete_all_nodes(session, current_user.id, canvas_id)
    await cs.delete_canvas(session, canvas_id, current_user.id)


@canvas_router.put("/update")
async def update_canvas(
    _: Annotated[UserAuth, Depends(get_current_active_user)],
    data: CanvasUpdateRequest,
    session: AsyncSession = Depends(get_async_session),
) -> None:
    await cs.update_canvas_name(session, data.canvas_id, data.canvas_name)

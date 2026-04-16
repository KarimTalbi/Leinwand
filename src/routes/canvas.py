from fastapi import APIRouter, Depends

from core import CanvasService, get_canvas_service
from data import CanvasRead

canvas_router = APIRouter(prefix="/canvas", tags=["canvas"])


@canvas_router.get("/canvas")
async def canvas(
    service: CanvasService = Depends(get_canvas_service),
) -> CanvasRead:
    return await service.list()


@canvas_router.post("/canvas")
async def canvas_sync(
    data: CanvasRead, service: CanvasService = Depends(get_canvas_service)
) -> None:
    await service.sync(data)

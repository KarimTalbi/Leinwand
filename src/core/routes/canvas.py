from fastapi import APIRouter, Depends

from data import CanvasRead, CanvasService
from src.core.dependencies import get_canvas_service

canvas_router = APIRouter(prefix="/canvas", tags=["Canvas"])


@canvas_router.get("")
async def canvas(service: CanvasService = Depends(get_canvas_service)) -> CanvasRead:
    result = await service.load_canvas()
    return result


@canvas_router.post("")
async def canvas_save(
    data: CanvasRead, service: CanvasService = Depends(get_canvas_service)
):
    await service.save_canvas()

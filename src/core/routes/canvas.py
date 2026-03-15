from fastapi import APIRouter, Depends

from data import CanvasRead, CanvasService
from src.core.dependencies import get_canvas_service

canvas_router = APIRouter(prefix="/canvas", tags=["Canvas"])


@canvas_router.get("/")
async def canvas(service: CanvasService = Depends(get_canvas_service)) -> CanvasRead:
    """
    Retrieves the entire canvas (nodes and edges).

    Args:
        service: The canvas service (injected).

    Returns:
        The current state of the canvas.
    """
    result = await service.load_canvas()
    print(result)
    return result

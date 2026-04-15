from fastapi import APIRouter, Depends
from data import CanvasRead
from core import CanvasService, get_canvas_service

canvas_router = APIRouter(prefix="/canvas", tags=["canvas"])


@canvas_router.get("/canvas")
async def canvas(
    service: CanvasService = Depends(get_canvas_service),
) -> CanvasRead:
    """
    Handles the GET request to the '/canvas' endpoint.

    This function retrieves the list of canvas objects by invoking the
    CanvasService's `list` method. The CanvasService instance is provided via
    dependency injection.

    Args:
        service: The CanvasService instance retrieved via the dependency injection
            system.

    Returns:
        CanvasRead: An instance of CanvasRead containing the result of the
        canvas service's list operation.
    """
    return await service.list()


@canvas_router.post("/canvas")
async def canvas_sync(
    data: CanvasRead, service: CanvasService = Depends(get_canvas_service)
) -> None:
    """
    Handles the synchronization of canvas data by invoking the relevant service.

    This endpoint is responsible for receiving and processing the canvas data
    and delegating the synchronization task to the corresponding service.

    Args:
        data: An instance of CanvasRead containing the canvas data to be synchronized.
        service: An optional dependency injection of CanvasService that provides
            the necessary synchronization functionality. Defaults to fetching the
            service instance via `get_canvas_service`.

    """
    await service.sync(data)

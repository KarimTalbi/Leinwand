from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core import CanvasService, get_canvas_service
from data import CanvasRead, get_async_session

canvas_router = APIRouter(prefix="/canvas", tags=["canvas"])


@canvas_router.get("/canvas")
async def canvas(
    service: CanvasService = Depends(get_canvas_service),
    session: AsyncSession = Depends(get_async_session)
) -> CanvasRead:



    return await service.list()


@canvas_router.post("/canvas")
async def canvas_sync(
    data: CanvasRead, service: CanvasService = Depends(get_canvas_service)
) -> None:
    await service.sync(data)

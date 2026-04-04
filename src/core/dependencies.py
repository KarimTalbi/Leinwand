from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasService, get_async_session


async def get_canvas_service(
    session: AsyncSession = Depends(get_async_session),
) -> CanvasService:
    return CanvasService(session)

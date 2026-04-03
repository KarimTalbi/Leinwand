from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasService, EdgeService, NodeService, get_async_session


async def get_canvas_service(
    session: AsyncSession = Depends(get_async_session),
) -> CanvasService:
    return CanvasService(session)


async def get_node_service(
    session: AsyncSession = Depends(get_async_session),
) -> NodeService:
    return NodeService(session)


async def get_edge_service(
    session: AsyncSession = Depends(get_async_session),
) -> EdgeService:
    return EdgeService(session)

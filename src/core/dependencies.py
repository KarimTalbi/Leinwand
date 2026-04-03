from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import EdgeService, NodeService, get_async_session


async def get_node_service(
    session: AsyncSession = Depends(get_async_session),
) -> NodeService:
    return NodeService(session)


async def get_edge_service(
    session: AsyncSession = Depends(get_async_session),
) -> EdgeService:
    return EdgeService(session)


async def get_canvas_service(
    session: AsyncSession = Depends(get_async_session),
) -> tuple[NodeService, EdgeService]:
    return NodeService(session), EdgeService(session)

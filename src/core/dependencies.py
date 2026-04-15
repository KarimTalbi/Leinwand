
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import get_async_session
from src.core.service import NodeService, EdgeService, CanvasService, UserService


def get_node_service(session: AsyncSession = Depends(get_async_session)) -> NodeService:

    return NodeService(session)


def get_edge_service(session: AsyncSession = Depends(get_async_session)) -> EdgeService:

    return EdgeService(session)


def get_canvas_service(
    session: AsyncSession = Depends(get_async_session),
) -> CanvasService:

    return CanvasService(session)


def get_user_service(
    session: AsyncSession = Depends(get_async_session),
) -> UserService:

    return UserService(session)

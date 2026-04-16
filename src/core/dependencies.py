from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from data import get_async_session
from llm import PromptNodeModel
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


def get_ai_model(request: Request) -> PromptNodeModel:
    return request.app.state.ai_model

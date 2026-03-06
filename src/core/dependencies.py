"""
Provides dependency-injected service factories for use within the application.

This module includes asynchronous functions to retrieve service instances for
managing canvases, nodes, and edges. These services facilitate operations on
respective database entities.
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasService, EdgeService, NodeService, get_async_session
from llm_logic import AiConfig, AiModel


async def get_canvas_service(session: AsyncSession = Depends(get_async_session)) -> CanvasService:
    """
    Asynchronously retrieves an instance of CanvasService.

    Args:
        session: The active database session provided via dependency injection.

    Returns:
        CanvasService: A service instance initialized with the provided session.
    """
    return CanvasService(session)


async def get_node_service(session: AsyncSession = Depends(get_async_session)) -> NodeService:
    """
    Asynchronously retrieves an instance of NodeService.

    Args:
        session: The active database session provided via dependency injection.

    Returns:
        NodeService: A service instance initialized with the provided session.
    """
    return NodeService(session)


async def get_edge_service(session: AsyncSession = Depends(get_async_session)) -> EdgeService:
    """
    Asynchronously retrieves an instance of EdgeService.

    Args:
        session: The active database session provided via dependency injection.

    Returns:
        EdgeService: A service instance initialized with the provided session.
    """
    return EdgeService(session)


def get_ai_model(config: AiConfig = AiConfig(), echo: bool = True) -> AiModel:
    return AiModel(config=config, echo=echo)

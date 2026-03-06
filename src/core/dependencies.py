"""
Dependency injection providers for services and models.
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import CanvasService, EdgeService, NodeService, get_async_session
from llm_logic import AiConfig, AiModel


async def get_canvas_service(session: AsyncSession = Depends(get_async_session)) -> CanvasService:
    """
    Provides a CanvasService instance.

    Args:
        session: The database session (injected).

    Returns:
        The canvas service.
    """
    return CanvasService(session)


async def get_node_service(session: AsyncSession = Depends(get_async_session)) -> NodeService:
    """
    Provides a NodeService instance.

    Args:
        session: The database session (injected).

    Returns:
        The node service.
    """
    return NodeService(session)


async def get_edge_service(session: AsyncSession = Depends(get_async_session)) -> EdgeService:
    """
    Provides an EdgeService instance.

    Args:
        session: The database session (injected).

    Returns:
        The edge service.
    """
    return EdgeService(session)


def get_ai_model(config: AiConfig = AiConfig(), echo: bool = True) -> AiModel:
    """
    Provides an AiModel instance.

    Args:
        config: The AI configuration.
        echo: Whether to echo the output.

    Returns:
        The AI model.
    """
    return AiModel(config=config, echo=echo)

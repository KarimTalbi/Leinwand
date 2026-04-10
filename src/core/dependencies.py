"""
Dependency injection modules for retrieving service instances using FastAPI and SQLAlchemy.

This module provides factory functions to create and return instances of service classes
(NodeService, EdgeService, and CanvasService). These instances are initialized with an
asynchronous database session, allowing seamless dependency injection for database operations.
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from data import get_async_session
from src.core.service import NodeService, EdgeService, CanvasService


def get_node_service(session: AsyncSession = Depends(get_async_session)) -> NodeService:
    """
    Retrieves an instance of NodeService initialized with the provided database session.

    Args:
        session (AsyncSession): An asynchronous database session used to interact
            with the database.

    Returns:
        NodeService: An instance of the NodeService initialized with the given
            session.
    """
    return NodeService(session)


def get_edge_service(session: AsyncSession = Depends(get_async_session)) -> EdgeService:
    """
    Creates and returns an instance of the EdgeService.

    Args:
        session (AsyncSession): The database session object used for database
            operations, provided via dependency injection.

    Returns:
        EdgeService: An instance of the EdgeService initialized with the provided
            session.
    """
    return EdgeService(session)


def get_canvas_service(
    session: AsyncSession = Depends(get_async_session),
) -> CanvasService:
    """
    Retrieves an instance of CanvasService using the provided database session.

    This function is designed to inject dependencies and return a CanvasService
    object initialized with the provided `session`. It is primarily used in a
    dependency injection context.

    Args:
        session: Asynchronous database session used for interacting with the
            database.

    Returns:
        CanvasService: An instance of CanvasService initialized with the
        given database session.
    """
    return CanvasService(session)

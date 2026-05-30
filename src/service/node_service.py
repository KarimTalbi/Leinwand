"""
This module provides services for managing nodes and edges in the database.

It interacts with the database to:
- List all nodes and edges for a specific canvas.
- Delete all nodes and edges for a specific canvas.
- Write new nodes and edges to a canvas (used for synchronization).
- Retrieve a specific node.
- Recursively fetch all ancestors (preceding connected nodes) for a given node.
"""
from typing import Any
from sqlalchemy import insert, select, delete, Result
from sqlalchemy.ext.asyncio import AsyncSession

from data import Node, NodeRead, Edge, EdgeRead
from data.queries import get_ancestors_recursive
from exceptions import NodeNotFoundException


async def list_nodes(session: AsyncSession, user_id: str, canvas_id: str) -> list[Node]:
    """
    Retrieves all nodes belonging to a specific canvas and user.

    Args:
        session: The asynchronous database session.
        user_id: The ID of the user.
        canvas_id: The ID of the canvas.

    Returns:
        A list of Node objects.
    """
    result: Result[tuple[Node]] = await session.execute(
        select(Node).where(Node.canvas_id == canvas_id).where(Node.user_id == user_id)
    )
    return list(result.scalars().all())


async def delete_all_nodes(session: AsyncSession, user_id: str, canvas_id: str) -> None:
    """
    Deletes all nodes associated with a specific canvas and user.

    Args:
        session: The asynchronous database session.
        user_id: The ID of the user.
        canvas_id: The ID of the canvas.
    """
    await session.execute(
        delete(Node).where(Node.canvas_id == canvas_id).where(Node.user_id == user_id)
    )
    await session.flush()


async def write_nodes(
    session: AsyncSession, nodes: list[NodeRead], user_id: str, canvas_id: str
) -> None:
    """
    Writes a list of new nodes to the database for a specific canvas.

    Args:
        session: The asynchronous database session.
        nodes: A list of NodeRead objects representing the nodes to be written.
        user_id: The ID of the user.
        canvas_id: The ID of the canvas.
    """
    data: list[dict[str, Any]] = [
        {**node.model_dump(), "user_id": user_id, "canvas_id": canvas_id} for node in nodes
    ]

    if data:
        await session.execute(insert(Node).values(data))

    await session.flush()


async def get_node(session: AsyncSession, node_id: str, user_id: str) -> Node:
    """
    Retrieves a specific node by its ID, ensuring it belongs to the given user.

    Args:
        session: The asynchronous database session.
        node_id: The ID of the node to retrieve.
        user_id: The ID of the user for ownership verification.

    Returns:
        The Node object.

    Raises:
        NodeNotFoundException: If the node does not exist or does not belong to the user.
    """
    node: Node | None = await session.get(Node, node_id)

    if node is None or node.user_id != user_id:
        raise NodeNotFoundException

    return node


async def get_ancestors(session: AsyncSession, node_id: str, user_id: str) -> list[dict[str, Any]]:
    """
    Recursively fetches all ancestor nodes connected to a specific node.

    This function utilizes a recursive SQL query to traverse the graph of edges
    backwards from the target node. It also slightly formats the resulting node
    data by merging the 'data' payload into the main dictionary.

    Args:
        session: The asynchronous database session.
        node_id: The ID of the starting node.
        user_id: The ID of the user (for initial node ownership check).

    Returns:
        A list of dictionaries representing the ancestor nodes and their properties.
    """
    db_node: Node = await get_node(session, node_id, user_id)

    result: Result[Any] = await session.execute(get_ancestors_recursive(db_node.id))
    nodes: list[dict[str, Any]] = [dict(row) for row in result.mappings().all()]

    for node in nodes:
        node["data"].pop("closed", None)
        node.update(node.pop("data"))

    return nodes


async def list_edges(session: AsyncSession, user_id: str, canvas_id: str) -> list[Edge]:
    """
    Retrieves all edges belonging to a specific canvas and user.

    Args:
        session: The asynchronous database session.
        user_id: The ID of the user.
        canvas_id: The ID of the canvas.

    Returns:
        A list of Edge objects.
    """
    result: Result[tuple[Edge]] = await session.execute(
        select(Edge).where(Edge.canvas_id == canvas_id).where(Edge.user_id == user_id)
    )
    return list(result.scalars().all())


async def delete_all_edges(session: AsyncSession, user_id: str, canvas_id: str) -> None:
    """
    Deletes all edges associated with a specific canvas and user.

    Args:
        session: The asynchronous database session.
        user_id: The ID of the user.
        canvas_id: The ID of the canvas.
    """
    await session.execute(
        delete(Edge).where(Edge.canvas_id == canvas_id).where(Edge.user_id == user_id)
    )
    await session.flush()


async def write_edges(session: AsyncSession, edges: list[EdgeRead], user_id: str, canvas_id: str):
    """
    Writes a list of new edges to the database for a specific canvas.

    Args:
        session: The asynchronous database session.
        edges: A list of EdgeRead objects representing the edges to be written.
        user_id: The ID of the user.
        canvas_id: The ID of the canvas.
    """
    data = [{**edge.model_dump(), "user_id": user_id, "canvas_id": canvas_id} for edge in edges]

    if data:
        await session.execute(insert(Edge).values(data))
    await session.flush()

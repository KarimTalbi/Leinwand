from sqlalchemy import insert, select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from data import Node, NodeRead, Edge, EdgeRead
from data.queries import get_ancestors_recursive
from exceptions import NodeNotFoundException


async def list_nodes(session: AsyncSession, user_id: str, canvas_id: str) -> list[Node]:
    result = await session.execute(
        select(Node).where(Node.canvas_id == canvas_id).where(Node.user_id == user_id)
    )
    return list(result.scalars().all())


async def delete_all_nodes(session: AsyncSession, user_id: str, canvas_id: str) -> None:
    await session.execute(
        delete(Node)
        .where(Node.canvas_id == canvas_id)
        .where(Node.user_id == user_id)
    )



async def write_nodes(session: AsyncSession, nodes: list[NodeRead], user_id: str, canvas_id: str):
    data = [{**node.model_dump(), "user_id": user_id, "canvas_id": canvas_id} for node in nodes]

    if data:
        await session.execute(insert(Node).values(data))


async def get_node(session: AsyncSession, node_id: str, user_id: str) -> Node:
    result = await session.execute(
        select(Node).where(Node.id == node_id).where(Node.user_id == user_id)
    )
    node = result.scalar_one_or_none()

    if not node:
        raise NodeNotFoundException

    return node


async def get_ancestors(session: AsyncSession, node_id: str, user_id: str):
    db_node = await get_node(session, node_id, user_id)

    result = await session.execute(get_ancestors_recursive(db_node.id))
    nodes = [dict(row) for row in result.mappings().all()]

    for node in nodes:
        node["data"].pop("closed", None)
        node.update(node.pop("data"))

    return nodes


async def list_edges(session: AsyncSession, user_id: str, canvas_id: str) -> list[Edge]:
    result = await session.execute(
        select(Edge).where(Edge.canvas_id == canvas_id).where(Edge.user_id == user_id)
    )
    return list(result.scalars().all())


async def delete_all_edges(session: AsyncSession, user_id: str, canvas_id: str) -> None:
    await session.execute(
        delete(Edge).where(Edge.canvas_id == canvas_id).where(Edge.user_id == user_id)
    )


async def write_edges(session: AsyncSession, edges: list[EdgeRead], user_id: str, canvas_id: str):
    data = [{**edge.model_dump(), "user_id": user_id, "canvas_id": canvas_id} for edge in edges]

    if data:
        await session.execute(insert(Edge).values(data))

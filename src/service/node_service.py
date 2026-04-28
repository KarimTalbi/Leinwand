from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from data import NodeCreate, Node, NodeUpdate, Canvas
from data.queries import get_ancestors_recursive
from exceptions import NodeNotFoundException, CanvasNotFoundException
from utils import service_monitor as monitor


@monitor
async def create_node(
    session: AsyncSession, node: NodeCreate, canvas_id: UUID, user_id: UUID
) -> Node:
    canvas = await session.get(Canvas, canvas_id)

    if not canvas or canvas.user_id != user_id:
        raise CanvasNotFoundException

    new_node = Node(**node.model_dump(), canvas_id=canvas_id)
    session.add(new_node)

    await session.flush()
    await session.refresh(new_node)

    return new_node


@monitor
async def list_nodes(
    session: AsyncSession, user_id: UUID, canvas_id: UUID
) -> list[Node]:
    result = await session.execute(
        select(Node)
        .join(Canvas)
        .where(Canvas.user_id == user_id, Node.canvas_id == canvas_id)
    )
    return list(result.scalars().all())


@monitor
async def get_node(session: AsyncSession, node_id: UUID, user_id: UUID) -> Node:
    result = await session.execute(
        select(Node).join(Canvas).where(Node.id == node_id, Canvas.user_id == user_id)
    )
    node = result.scalar_one_or_none()

    if not node:
        raise NodeNotFoundException

    return node


@monitor
async def update_node(
    session: AsyncSession, node_id: UUID, node_update: NodeUpdate, user_id: UUID
) -> Node:
    db_node = await get_node(session, node_id, user_id)

    for key, value in node_update.model_dump(exclude_unset=True).items():
        setattr(db_node, key, value)

    await session.flush()
    await session.refresh(db_node)

    return db_node


@monitor
async def update_node_data(
    session: AsyncSession, node_id: UUID, user_id: UUID, node_data: dict
) -> Node:
    result = await session.execute(
        update(Node)
        .where(
            Node.id == node_id, Node.canvas_id == Canvas.id, Canvas.user_id == user_id
        )
        .values(data=Node.data.op("||")(node_data))
        .returning(Node)
    )

    await session.flush()
    return result.scalar_one_or_none()


@monitor
async def delete_node(session: AsyncSession, node_id: UUID, user_id: UUID) -> UUID:
    db_node = await get_node(session, node_id, user_id)

    await session.delete(db_node)
    await session.flush()

    return node_id


@monitor
async def get_ancestors(session: AsyncSession, node_id: UUID, user_id: UUID):
    db_node = await get_node(session, node_id, user_id)

    result = await session.execute(get_ancestors_recursive(db_node.id))
    nodes = [dict(row) for row in result.mappings().all()]

    for node in nodes:
        node["data"].pop("closed", None)
        node.update(node.pop("data"))

    return nodes

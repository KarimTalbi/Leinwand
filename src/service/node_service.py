from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data import NodeCreate, Node, NodeUpdate, Canvas


async def create_node(
    session: AsyncSession, node: NodeCreate, canvas_id: UUID, user_id: UUID
) -> Node:
    canvas = await session.get(Canvas, canvas_id)

    if not canvas or canvas.user_id != user_id:  # TODO: better exception
        raise ValueError("Canvas not found or not owned by the user")

    new_node = Node(**node.model_dump(), canvas_id=canvas_id)
    session.add(new_node)

    await session.flush()
    await session.refresh(new_node)

    return new_node


async def list_nodes(
    session: AsyncSession, user_id: UUID, canvas_id: UUID
) -> Sequence[Node]:
    result = await session.execute(
        select(Node)
        .join(Canvas)
        .where(Canvas.user_id == user_id, Node.canvas_id == canvas_id)
    )
    return result.scalars().all()


async def get_node(session: AsyncSession, node_id: UUID, user_id: UUID) -> Node | None:
    result = await session.execute(
        select(Node).join(Canvas).where(Node.id == node_id, Canvas.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_node(
    session: AsyncSession, node_id: UUID, node_update: NodeUpdate, user_id: UUID
) -> Node:
    db_node = await get_node(session, node_id, user_id)

    for key, value in node_update.model_dump(exclude_unset=True).items():
        setattr(db_node, key, value)

    await session.flush()
    await session.refresh(db_node)

    return db_node


async def delete_node(session: AsyncSession, node_id: UUID, user_id: UUID) -> UUID:
    db_node = await get_node(session, node_id, user_id)

    await session.delete(db_node)
    await session.flush()

    return node_id


# from typing import Any

# from service import NodeService


# def global_summary(ancestry: tuple[list[dict[str, Any]], ...]) -> list[dict[str, Any]]:

#    summary = [
#        {
#            "type": "global_summary",
#            "total_streams": len(ancestry),
#            "total_nodes": sum(len(a) for a in ancestry),
#        }
#    ]

#    for i, a in enumerate(ancestry):
#        summary.append(
#            {
#                "type": "stream_summary",
#                "stream_id": str(i + 1),
#                "total_nodes": len(a),
#            }
#        )
#        summary.extend(a)

#    return summary


# async def build_context(
#    service: NodeService, node_id: str, targets: int = 1
# ) -> list[dict[str, Any]]:


#    results = []
#    for i in range(targets):
#        results.append(await service.get_ancestors(node_id, f"target-{i + 1}"))

#    return global_summary(tuple(results))

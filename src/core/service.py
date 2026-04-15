import json
import uuid
from collections.abc import Sequence
from typing import Any

from fastapi import HTTPException
from sqlalchemy import select, delete
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from data import (
    Node,
    NodeRead,
    Edge,
    EdgeRead,
    CanvasRead,
    get_ancestors_recursive,
    User,
)
from utils import service_monitor


class BaseService[T, R]:

    def __init__(self, session: AsyncSession, model: type[T], read_model: type[R]):
        self.model = model
        self.session = session
        self.read_model = read_model
        self.conflict_set_ = {}

    @service_monitor
    async def list(self) -> Sequence[T]:

        result = await self.session.execute(select(self.model))
        return result.scalars().all()

    @service_monitor
    async def get(self, ids: Sequence[str]) -> Sequence[T]:

        result = await self.session.execute(
            select(self.model).where(self.model.id.in_(ids))
        )
        return result.scalars().all()

    @service_monitor
    async def delete_not_in(self, ids: Sequence[str]) -> None:

        await self.session.execute(delete(self.model).where(self.model.id.notin_(ids)))

    @service_monitor
    async def update(self, items: Sequence[R]):

        if not items:
            return

        await self.session.execute(
            insert(self.model)
            .values(
                [
                    item.model_dump(exclude_unset=True, exclude_none=True)
                    for item in items
                ]
            )
            .on_conflict_do_update(
                index_elements=["id"],
                set_=self.conflict_set_,
            )
        )


class NodeService(BaseService[Node, NodeRead]):

    def __init__(self, session: AsyncSession):

        super().__init__(session, Node, NodeRead)
        self.conflict_set_ = {
            "type": insert(Node).excluded.type,
            "position": insert(Node).excluded.position,
            "data": insert(Node).excluded.data,
        }

    @service_monitor
    async def get_ancestors(
        self, node_id: str, target_handle: str | None = None
    ) -> list[dict[str, Any]]:

        result = await self.session.execute(
            get_ancestors_recursive(node_id, target_handle)
        )

        rows = [dict(row) for row in result.mappings()]

        for row in rows:
            row.update(json.loads(row["data"]))
            for key in ["data", "id", "position", "closed", "label"]:
                row.pop(key)

        return rows


class EdgeService(BaseService[Edge, EdgeRead]):

    def __init__(self, session: AsyncSession):
        super().__init__(session, Edge, EdgeRead)
        self.conflict_set_ = {
            "source": insert(Edge).excluded.source,
            "target": insert(Edge).excluded.target,
            "source_handle": insert(Edge).excluded.source_handle,
            "target_handle": insert(Edge).excluded.target_handle,
        }


class CanvasService:

    def __init__(self, session: AsyncSession):
        self.nodes = NodeService(session)
        self.edges = EdgeService(session)

    async def list(self) -> CanvasRead:

        return CanvasRead(nodes=await self.nodes.list(), edges=await self.edges.list())

    async def delete_not_in(self, data: CanvasRead) -> None:

        node_ids = [n.id for n in data.nodes]
        edge_ids = [e.id for e in data.edges]

        await self.edges.delete_not_in(edge_ids)
        await self.nodes.delete_not_in(node_ids)

    async def update(self, data: CanvasRead) -> None:

        await self.nodes.update(data.nodes)
        await self.edges.update(data.edges)

    async def sync(self, data: CanvasRead) -> None:

        await self.delete_not_in(data)
        await self.update(data)


class UserService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_model = User

    @service_monitor
    async def get_user(self, username: str) -> User:
        user = await self.session.execute(
            select(self.user_model).where(self.user_model.username == username)
        )
        return user.scalars().first()

    @service_monitor
    async def is_user(self, username: str) -> bool:
        user = await self.get_user(username)
        return user is not None

    @service_monitor
    async def create_user(self, username: str, hashed_password: str) -> User:
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            username=username,
            hashed_password=hashed_password,
            disabled=False,
        )

        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    @service_monitor
    async def delete_user(self, username: str) -> None:
        user = await self.session.get(self.user_model, username)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await self.session.delete(user)

    @service_monitor
    async def update_user(self, username: str, **kwargs) -> User:
        user = await self.session.get(self.user_model, username)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        for key, value in kwargs.items():
            setattr(user, key, value)

        await self.session.commit()
        await self.session.refresh(user)
        return user

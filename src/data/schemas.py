import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class NodeBase(BaseModel):
    type: str
    position: dict[str, float]
    data: dict[str, Any]
    canvas_id: uuid.UUID

class NodeCreate(NodeBase):
    user_id: uuid.UUID | None = None


class NodeUpdate(BaseModel):
    id: uuid.UUID
    position: dict[str, float] | None = None
    data: dict[str, Any] | None = None


class NodeRead(NodeBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class EdgeBase(BaseModel):
    source: uuid.UUID
    target: uuid.UUID
    source_handle: str | None = None
    target_handle: str | None = None
    canvas_id: uuid.UUID


class EdgeCreate(EdgeBase):
    user_id: uuid.UUID | None = None


class EdgeRead(BaseModel):
    id: uuid.UUID
    source: uuid.UUID
    target: uuid.UUID
    source_handle: str | None = None
    target_handle: str | None = None
    canvas_id: uuid.UUID

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )


class CanvasRead(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]

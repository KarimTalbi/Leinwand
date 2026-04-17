from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class NodeBase(BaseModel):
    type: str
    position: dict[str, float]
    data: dict[str, Any]


class NodeCreate(NodeBase): ...


class NodeUpdate(BaseModel):
    id: str
    position: dict[str, float] | None = None
    data: dict[str, Any] | None = None


class NodeRead(NodeBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


class EdgeBase(BaseModel):
    source: str
    target: str
    source_handle: str | None = None
    target_handle: str | None = None


class EdgeCreate(EdgeBase): ...


class EdgeRead(BaseModel):
    id: str
    source: str
    target: str
    source_handle: str | None = None
    target_handle: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )


class CanvasRead(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]

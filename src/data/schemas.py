from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NodeRead(BaseModel):
    id: UUID
    type: str
    position: dict[str, float]
    data: dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class NodeCreate(NodeRead): ...


class NodeUpdate(BaseModel):
    id: UUID
    type: str | None = Field(default=None)
    position: dict[str, float] | None = Field(default=None)
    data: dict[str, Any] | None = Field(default=None)


class EdgeRead(BaseModel):
    id: UUID
    source: UUID
    target: UUID
    source_handle: str | None = Field(default=None, alias="sourceHandle")
    target_handle: str | None = Field(default=None, alias="targetHandle")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class EdgeCreate(EdgeRead): ...


class EdgeUpdate(BaseModel):
    id: UUID
    source: UUID | None = Field(default=None)
    target: UUID | None = Field(default=None)
    source_handle: str | None = Field(default=None)
    target_handle: str | None = Field(default=None)


class CanvasRead(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]


class CanvasCreate(BaseModel):
    nodes: list[NodeCreate]
    edges: list[EdgeCreate]


class ConfRes(BaseModel):
    message: str
    id: Any | None = Field(default=None)


class AncestorNode(BaseModel):
    id: UUID
    type: str
    position: dict[str, float]
    data: dict[str, Any]
    depth: int

    model_config = ConfigDict(from_attributes=True)


class AncestorResponse(BaseModel):
    node_id: UUID
    target_handle: str | None = Field(default=None)
    total: int
    ancestors: list[AncestorNode]

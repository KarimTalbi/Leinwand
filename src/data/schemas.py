from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NodeData(BaseModel):
    label: str | None = None
    prompt: str | None = None
    response: str | None = None


class NodeRead(BaseModel):
    id: UUID
    type: str
    position: dict[str, float]
    data: NodeData

    model_config = ConfigDict(from_attributes=True)


class NodeCreate(NodeRead): ...


class NodeUpdate(BaseModel):
    id: UUID
    type: str | None = Field(default=None)
    position: dict[str, float] | None = Field(default=None)
    data: NodeData | None = Field(default=None)


class EdgeRead(BaseModel):
    id: UUID
    source: UUID
    target: UUID

    model_config = ConfigDict(from_attributes=True)


class EdgeCreate(EdgeRead): ...


class EdgeUpdate(BaseModel):
    id: UUID
    source: UUID | None = Field(default=None)
    target: UUID | None = Field(default=None)


class CanvasRead(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]


class CanvasCreate(BaseModel):
    nodes: list[NodeCreate]
    edges: list[EdgeCreate]


class ConfRes(BaseModel):
    message: str
    id: Any

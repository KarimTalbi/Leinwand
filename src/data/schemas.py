from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NodeRead(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class NodeUpdate(BaseModel):
    id: str
    type: str | None = Field(default=None)
    position: dict[str, float] | None = Field(default=None)
    data: dict[str, Any] | None = Field(default=None)


class EdgeRead(BaseModel):
    id: str
    source: str
    target: str
    source_handle: str | None = Field(default=None, alias="sourceHandle")
    target_handle: str | None = Field(default=None, alias="targetHandle")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class CanvasRead(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]


class Confirmation(BaseModel):
    message: str


class AncestorNode(BaseModel):
    id: UUID
    type: str
    position: dict[str, float]
    data: dict[str, Any]
    depth: int

    model_config = ConfigDict(from_attributes=True)


class AncestorResponse(BaseModel):
    node_id: str
    target_handle: str | None = Field(default=None)
    total: int
    ancestors: list[AncestorNode]

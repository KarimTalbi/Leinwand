from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class NodeRead(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


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


class AiResponse(BaseModel):
    title: str
    response: str


class AiRequest(BaseModel):
    prompt: str
    target_id: str
    source_handle: str | None = Field(default=None, alias="sourceHandle")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class MergeRequest(BaseModel):
    """Request to merge branches"""

    target_id: str


class MergeResponse(BaseModel):
    conflicts: list[str] | None = Field(default=None)
    has_conflicts: bool = Field(default=False, alias="hasConflicts")
    options: list[str] | None = Field(default=None)
    context: str
    prompt: str = Field(default="")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class MergeResolveRequest(BaseModel):
    target_id: str
    conflicts: str
    resolution: str
    options: str
    context: str
    prompt: str | None = Field(default=None)


class AncestorNode(BaseModel):
    id: str
    type: str
    position: dict[str, float]
    data: dict[str, Any]
    depth: int

    model_config = ConfigDict(from_attributes=True)


class AncestorResponse(BaseModel):
    node_id: str
    source_handle: str | None = Field(default=None)
    total: int
    ancestors: list[AncestorNode]

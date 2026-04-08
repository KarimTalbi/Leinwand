from typing import Any

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


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
    source_handle: str | None = None
    target_handle: str | None = None

    model_config = ConfigDict(
        from_attributes=True, populate_by_name=True, alias_generator=to_camel, extra="ignore"
    )


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
    target_id: str


class MergeResponse(BaseModel):
    data: list[dict[str, Any]]


class ResolveRequest(BaseModel):
    """Request to resolve a merge conflict"""

    target_id: str
    conflicts: list[str]
    resolution: list[str]
    options: list[str]
    context: str
    prompt: str | None = None


class AncestorNode(BaseModel):
    id: str
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

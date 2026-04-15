from typing import Any

from pydantic import BaseModel, ConfigDict
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
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )


class CanvasRead(BaseModel):

    nodes: list[NodeRead]
    edges: list[EdgeRead]


class AiResponse(BaseModel):

    response: str


class AiRequest(BaseModel):

    prompt: str
    target_id: str
    include_context: bool = True

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class SummaryRequest(BaseModel):

    target_id: str

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class MergeRequest(BaseModel):

    target_id: str


class MergeResponse(BaseModel):

    data: list[dict[str, Any]]

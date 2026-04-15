from typing import Any

from pydantic import BaseModel, ConfigDict


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
from uuid import UUID
from typing import Any, Annotated

from pydantic import BaseModel, ConfigDict, AfterValidator
from pydantic.alias_generators import to_camel


def check_uuid4(v: str) -> str:
    try:
        UUID(v)
        return v
    except ValueError:
        raise ValueError("Invalid UUID4 format")


UUID4Str = Annotated[str, AfterValidator(check_uuid4)]


class NodeRead(BaseModel):
    id: UUID4Str
    type: str
    position: dict[str, float]
    data: dict[str, Any]
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )

class LoadDataResponse(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]


class EdgeRead(BaseModel):
    id: UUID4Str
    source: UUID4Str
    target: UUID4Str
    source_handle: str | None = None
    target_handle: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )


class CanvasRead(BaseModel):
    id: UUID4Str
    name: str
    data: dict[str, Any]

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserBase(BaseModel):
    username: str
    disabled: bool | None = None


class UserAuth(UserBase):
    id: UUID4Str


class UserInDb(UserBase):
    hashed_password: str

    model_config = ConfigDict(from_attributes=True)


class UserRead(UserBase):
    username: str

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class UserCreate(UserBase):
    id: UUID4Str
    username: str
    password: str


class AiResponse(BaseModel):
    response: str

class ChatRequest(BaseModel):
    prompt: str
    type: str = "chat"

class ChatResponse(AiResponse): ...


class SummaryResponse(AiResponse): ...


class MergeResolveResponse(AiResponse): ...


class MergeResponse(AiResponse):
    has_issues: bool


class MergeRequest(BaseModel):
    check_consistency: bool


class MergeAnswer(BaseModel):
    closed: bool | None = None
    problems: str | None = None
    solution: str | None = None
    context: list[dict[str, Any]] | None = None


from typing import Annotated, Any
from uuid import UUID

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

from utils import decrypt_key


def check_uuid4(v: str) -> str:
    try:
        UUID(v)
        return v
    except ValueError as exc:
        raise ValueError("Invalid UUID4 format") from exc


UUID4Str = Annotated[str, AfterValidator(check_uuid4)]


class NodeRead(BaseModel):
    id: UUID4Str
    type: str
    position: dict[str, float | int]
    data: dict[str, Any]

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        extra="ignore",
    )


class LoadDataResponse(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]
    time: int


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
    updated_at: int
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
    user_data: dict[str, Any] | None = None

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


class LLMModelConfig(BaseModel):
    model: str
    model_provider: str
    api_key: str
    temperature: Annotated[float | int, Field(ge=0.0, le=2.0)] | None = None
    max_tokens: Annotated[int, Field(ge=0)] | None = None
    timeout: Annotated[int, Field(ge=0)] | None = None
    max_retries: Annotated[int, Field(ge=0)] | None = None
    model_kwargs: dict[str, Any] | None = None

    @field_validator("api_key", mode="after")
    @classmethod
    def decrypt(cls, v: str) -> str:
        return decrypt_key(v)


class ApiKeyRead(BaseModel):
    id: UUID4Str
    key: str
    models: list[str] | None = None
    model_provider: str | None = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )

class UserData(BaseModel):
    data: dict[str, Any] | None = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )


class ApiKeyReturn(BaseModel):
    id: UUID4Str
    key: str
    models: list[str] | None = None
    model_provider: str | None = None

    @field_validator("key", mode="after")
    @classmethod
    def mask_key(cls, v: str) -> str:
        decrypted_key = decrypt_key(v)
        return decrypted_key[:6] + "..." + decrypted_key[-4:]

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )
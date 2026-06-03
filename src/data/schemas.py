"""
This module defines the Pydantic schemas used for data validation,
serialization, and deserialization in the FastAPI application.

It includes schemas for:
- API request and response bodies.
- Data models for nodes, edges, and canvases.
- User authentication and management.
- Language Model (LLM) interactions and configurations.
- API key management.

The schemas use Pydantic's features for validation (e.g., UUID checks),
aliasing (e.g., camelCase for JSON), and model configuration.
"""
from typing import Annotated, Any
from uuid import UUID

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel

from utils import decrypt_key

# --- Helper ---


def check_uuid4(v: str) -> str:
    """
    Validates if the given string is a valid UUID version 4.

    Args:
        v: The string to validate.

    Returns:
        The original string if it is a valid UUID4.

    Raises:
        ValueError: If the string is not a valid UUID4.
    """
    try:
        UUID(v)
        return v
    except ValueError as exc:
        raise ValueError("Invalid UUID4 format") from exc


UUID4Str = Annotated[str, AfterValidator(check_uuid4)]
"""A type annotation for strings that must be a valid UUID4."""


# --- Data ---


class SyncDataRequest(BaseModel):
    """Schema for a request to synchronize canvas data."""
    nodes: list["NodeRead"]
    edges: list["EdgeRead"]
    time: int


class SyncDataResponse(BaseModel):
    """Schema for the response after synchronizing canvas data."""
    nodes: list["NodeRead"]
    edges: list["EdgeRead"]


class NodeRead(BaseModel):
    """Schema for representing a node when read from the database."""
    id: UUID4Str
    type: str
    position: dict[str, float | int]
    data: dict[str, Any]

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        extra="ignore",
    )


class EdgeRead(BaseModel):
    """Schema for representing an edge when read from the database."""
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
    """Schema for representing a canvas when read from the database."""
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


class CanvasUpdateRequest(BaseModel):
    """Schema for a request to update a canvas's properties."""
    canvas_id: str
    canvas_name: str


# --- Auth ---


class Token(BaseModel):
    """Schema for an OAuth2 access token response."""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for the data encoded within a JWT access token."""
    username: str | None = None


class UserBase(BaseModel):
    """Base schema for user properties."""
    username: str
    disabled: bool | None = None


class UserAuth(UserBase):
    """Schema for user data used in an authentication context."""
    id: UUID4Str


class UserInDb(UserBase):
    """Schema for a user object as stored in the database, including the hashed password."""
    hashed_password: str

    model_config = ConfigDict(from_attributes=True)


class UserRead(UserBase):
    """Schema for returning user information to a client (omitting sensitive data)."""
    username: str
    user_data: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class UserCreate(UserBase):
    """Schema for creating a new user, including the plaintext password."""
    id: UUID4Str
    username: str
    password: str


class UserData(BaseModel):
    """Schema for updating or reading user-specific application data."""
    data: dict[str, Any] | None = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )

class UserUpdateName(BaseModel):
    """Schema for updating a user's name."""
    name: str

class UserUpdatePassword(BaseModel):
    """Schema for updating a user's password."""
    old_password: str
    new_password: str


# --- LLM ---


class LlmResponse(BaseModel):
    """Schema for a generic response from a Language Model."""
    response: str


class MergeResponse(BaseModel):
    """Schema for the response from a data merge operation."""
    context: list[dict[str, Any]]
    has_issues: bool
    problems: str | None = None


class LLMMergeResponse(LlmResponse):
    """Schema for a response from an LLM-assisted merge, indicating if issues were found."""
    has_issues: bool


class MergeResolveResponse(BaseModel):
    """Schema for the response after resolving merge conflicts."""
    context: list[dict[str, Any]]


class MergeRequest(NodeRead):
    """Schema for a request to perform a merge operation on a node."""
    check_consistencies: bool = True


class LLMModelConfig(BaseModel):
    """
    Schema for configuring a Language Model for a request.

    The API key is automatically decrypted after validation.
    """
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
        """Decrypts the API key."""
        return decrypt_key(v)


# --- Api Keys ---


class ApiKeyRead(BaseModel):
    """Schema for representing an API key when read from the database."""
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


class ApiKeyReturn(BaseModel):
    """
    Schema for returning an API key to the client.

    The key is masked to avoid exposing the full key.
    """
    id: UUID4Str
    key: str
    models: list[str] | None = None
    model_provider: str | None = None

    @field_validator("key", mode="after")
    @classmethod
    def mask_key(cls, v: str) -> str:
        """Masks the API key, showing only the first 6 and last 4 characters."""
        decrypted_key = decrypt_key(v)
        return decrypted_key[:6] + "..." + decrypted_key[-4:]

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )

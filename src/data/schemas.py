import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class NodeBase(BaseModel):
    type: str
    position: dict[str, float]
    data: dict[str, Any]


class NodeCreate(NodeBase): ...


class NodeUpdate(BaseModel):
    position: dict[str, float] | None = None
    data: dict[str, Any] | None = None


class NodeRead(NodeBase):
    id: uuid.UUID
    canvas_id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)


class NodeReadList(BaseModel):
    nodes: list[NodeRead]


class EdgeBase(BaseModel):
    source: uuid.UUID
    target: uuid.UUID
    source_handle: str | None = None
    target_handle: str | None = None
    canvas_id: uuid.UUID


class EdgeCreate(EdgeBase): ...


class EdgeRead(BaseModel):
    id: uuid.UUID
    source: uuid.UUID
    target: uuid.UUID
    source_handle: str | None = None
    target_handle: str | None = None
    canvas_id: uuid.UUID

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        extra="ignore",
    )


class EdgeReadList(BaseModel):
    edges: list[EdgeRead]


class CanvasBase(BaseModel):
    name: str
    data: dict[str, Any]


class CanvasCreate(CanvasBase): ...


class CanvasRead(CanvasBase):
    id: uuid.UUID
    data: dict[str, Any]


class CanvasUpdate(BaseModel):
    id: uuid.UUID
    name: str | None = None
    data: dict[str, Any] | None = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class UserBase(BaseModel):
    username: str
    disabled: bool | None = None


class UserAuth(UserBase):
    id: uuid.UUID


class UserInDb(UserBase):
    hashed_password: str

    model_config = ConfigDict(from_attributes=True)


class UserRead(UserBase):
    username: str
    disabled: bool

    model_config = ConfigDict(from_attributes=True)


class UserCreate(UserBase):
    username: str
    password: str

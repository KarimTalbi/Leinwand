import uuid
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ReadBase(BaseModel):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class UpdateBase(BaseModel):
    id: UUID


class CreateBase(BaseModel):
    id: UUID = Field(default_factory=uuid.uuid4)

    @field_validator("id", mode="before")
    @classmethod
    def prepare_id(cls, v: Any) -> UUID:
        if isinstance(v, UUID):
            return v

        if isinstance(v, str) and v.strip():
            try:
                return UUID(v)
            except ValueError:
                return uuid.uuid4()

        return uuid.uuid4()


class NodeBase(BaseModel):
    type: str
    pos_x: float
    pos_y: float
    label: str


class NodeRead(NodeBase, ReadBase):
    prompt: str | None = None
    response: str | None = None


class NodeUpdate(UpdateBase):
    type: str | None = None
    pos_x: float | None = None
    pos_y: float | None = None
    label: str | None = None
    prompt: str | None = None
    response: str | None = None


class NodeCreate(NodeBase, CreateBase):
    prompt: str | None = None
    response: str | None = None


class EdgeBase(BaseModel):
    source_id: UUID
    target_id: UUID


class EdgeCreate(CreateBase, EdgeBase): ...


class EdgeRead(EdgeBase, ReadBase): ...


class EdgeUpdate(UpdateBase):
    source_id: UUID | None = None
    target_id: UUID | None = None


class CanvasRead(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]

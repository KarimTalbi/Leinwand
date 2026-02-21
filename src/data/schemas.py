from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReadBase(BaseModel):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

class NodeBase(BaseModel):
    type: str
    pos_x: float
    pos_y: float
    label: str


class NodeCreate(NodeBase): ...


class NodeRead(NodeBase, ReadBase):
    prompt: str | None = None
    response: str | None = None


class NodeUpdate(BaseModel):
    type: str | None = None
    pos_x: float | None = None
    pos_y: float | None = None
    label: str | None = None
    prompt: str | None = None
    response: str | None = None


class EdgeBase(BaseModel):
    source: UUID
    target: UUID


class EdgeCreate(EdgeBase): ...


class EdgeRead(EdgeBase, ReadBase): ...


class EdgeUpdate(BaseModel):
    source: UUID | None = None
    target: UUID | None = None
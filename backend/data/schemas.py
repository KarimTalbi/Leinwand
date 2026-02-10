from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from data import Node, Edge

class NodeBase(BaseModel):
    type: str
    pos_x: float
    pos_y: float
    label: str

class NodeCreate(NodeBase):
    pass

class NodeRead(NodeBase):
    id: UUID
    prompt: Optional[str] = None
    response: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class NodeUpdate(BaseModel):
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    label: Optional[str] = None
    prompt: Optional[str] = None
    response: Optional[str] = None

class EdgeBase(BaseModel):
    source: UUID
    target: UUID

class EdgeCreate(EdgeBase):
    pass

class EdgeRead(EdgeBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

class EdgeUpdate(BaseModel):
    pass

class CanvasRead(BaseModel):
    nodes: list[Node]
    edges: list[Edge]

    model_config = ConfigDict(from_attributes=True)



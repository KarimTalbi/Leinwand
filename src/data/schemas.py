from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReadBase(BaseModel):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class UpdateBase(BaseModel):
    id: UUID | str | None = None

    def model_post_init(self, context: Any, /) -> None:
        if not isinstance(self.id, UUID):
            self.id = None


class NodeBase(BaseModel):
    type: str
    pos_x: float
    pos_y: float
    label: str


class NodeCreate(NodeBase): ...


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


class EdgeBase(BaseModel):
    source: UUID
    target: UUID


class EdgeCreate(EdgeBase): ...


class EdgeRead(EdgeBase, ReadBase): ...


class EdgeUpdate(UpdateBase):
    source: UUID | None = None
    target: UUID | None = None


class CanvasRead(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]

    @property
    def mapped_nodes(self) -> dict[UUID, NodeRead]:
        return {node.id: node for node in self.nodes}

    @property
    def mapped_edges(self) -> dict[UUID, EdgeRead]:
        return {edge.id: edge for edge in self.edges}


class CanvasUpdate(BaseModel):
    nodes: list[NodeUpdate]
    edges: list[EdgeUpdate]

import uuid
from functools import cached_property
from typing import Any, Iterable, Self
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    computed_field,
    field_validator,
    model_validator,
)

from src.data.db_models import Edge, Node


class ReadBase(BaseModel):
    id: UUID | str

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


class NodeData(BaseModel):
    label: str
    prompt: str | None = Field(default=None)
    response: str | None = Field(default=None)


class NodeRead(ReadBase):
    type: str
    pos_x: float
    pos_y: float

    data: NodeData | None = Field(default=None)

    @model_validator(mode="before")
    @classmethod
    def build_data_object(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("data"):
                data["data"] = {
                    "label": data.get("label"),
                    "prompt": data.get("prompt"),
                    "response": data.get("response"),
                }

        else:
            if not getattr(data, "data", None):
                setattr(
                    data,
                    "data",
                    {
                        "label": data.label,
                        "prompt": data.prompt,
                        "response": data.response,
                    },
                )
        return data

    @computed_field
    @property
    def position(self) -> dict[str, float]:
        return {"x": self.pos_x, "y": self.pos_y}

    class Config:
        from_attributes = True


class NodeUpdate(UpdateBase):
    type: str | None = Field(default=None)
    pos_x: float | None = Field(default=None)
    pos_y: float | None = Field(default=None)
    label: str | None = Field(default=None)
    prompt: str | None = Field(default=None)
    response: str | None = Field(default=None)


class NodeCreate(CreateBase):
    type: str
    position: dict[str, float]
    data: NodeData

    @property
    def pos_x(self) -> float:
        return self.position.get("x", 0.0)

    @property
    def pos_y(self) -> float:
        return self.position.get("y", 0.0)

    @property
    def label(self) -> str:
        return self.data.label

    @property
    def prompt(self) -> str | None:
        return self.data.prompt

    @property
    def response(self) -> str | None:
        return self.data.response

    model_config = ConfigDict(from_attributes=True)


class EdgeBase(BaseModel):
    source: UUID
    target: UUID


class EdgeCreate(CreateBase, EdgeBase): ...


class EdgeRead(EdgeBase, ReadBase): ...


class EdgeUpdate(UpdateBase):
    source: UUID | None = Field(default=None)
    target: UUID | None = Field(default=None)


class CanvasRead(BaseModel):
    nodes: list[NodeRead]
    edges: list[EdgeRead]

    @classmethod
    def from_db(cls, nodes: Iterable[Node], edges: Iterable[Edge]) -> Self:
        return cls(
            nodes=[NodeRead.model_validate(node) for node in nodes],
            edges=[EdgeRead.model_validate(edge) for edge in edges],
        )

    @cached_property
    def node_map(self) -> dict[UUID, NodeRead]:
        return {n.id: n for n in self.nodes}

    @cached_property
    def edge_links(self) -> list[tuple[UUID, UUID]]:
        return [(e.source, e.target) for e in self.edges]


class CanvasCreate(BaseModel):
    nodes: list[NodeCreate]
    edges: list[EdgeCreate]


class DeleteResponse(BaseModel):
    message: str
    id: UUID


class PromptRequest(BaseModel):
    prompt: str
    target_id: UUID | str

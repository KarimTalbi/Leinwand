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
    """
    Base model for reading data.

    Attributes:
        id: The unique identifier.
    """

    id: UUID | str

    model_config = ConfigDict(from_attributes=True)


class UpdateBase(BaseModel):
    """
    Base model for updating data.

    Attributes:
        id: The unique identifier.
    """

    id: UUID


class CreateBase(BaseModel):
    """
    Base model for creating data.

    Attributes:
        id: The unique identifier.
    """

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
    """
    Base structure for a node.

    Attributes:
        type: The type of the node.
        pos_x: The horizontal position.
        pos_y: The vertical position.
        label: The label of the node.
    """

    type: str
    pos_x: float
    pos_y: float
    label: str


class NodeData(BaseModel):
    label: str
    prompt: str | None = Field(default=None)
    response: str | None = Field(default=None)


class NodeRead(ReadBase):
    """
    Model for reading node data.

    Attributes:
        id: The unique identifier.
        type: The type of the node.
        pos_x: The horizontal position.
        pos_y: The vertical position.
        data: The node data.
    """

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
    """
    Model for updating node data.

    Attributes:
        id: The unique identifier.
        type: The type of the node.
        pos_x: The horizontal position.
        pos_y: The vertical position.
        label: The label of the node.
        prompt: The input prompt.
        response: The generated response.
    """

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
    """
    Base structure for an edge.

    Attributes:
        source: The identifier of the source node.
        target: The identifier of the target node.
    """

    source: UUID
    target: UUID


class EdgeCreate(CreateBase, EdgeBase):
    """
    Model for creating edge data.

    Attributes:
        id: The unique identifier.
        source: The identifier of the source node.
        target: The identifier of the target node.
    """

    ...


class EdgeRead(EdgeBase, ReadBase):
    """
    Model for reading edge data.

    Attributes:
        id: The unique identifier.
        source: The identifier of the source node.
        target: The identifier of the target node.
    """

    ...


class EdgeUpdate(UpdateBase):
    """
    Model for updating edge data.

    Attributes:
        id: The unique identifier.
        source: The identifier of the source node.
        target: The identifier of the target node.
    """

    source: UUID | None = Field(default=None)
    target: UUID | None = Field(default=None)


class CanvasRead(BaseModel):
    """
    Model for reading the entire canvas.

    Attributes:
        nodes: The list of nodes on the canvas.
        edges: The list of edges on the canvas.
    """

    nodes: list[NodeRead]
    edges: list[EdgeRead]

    @classmethod
    def from_db(cls, nodes: Iterable[Node], edges: Iterable[Edge]) -> Self:
        """
        Factory method to create CanvasRead from raw SQLAlchemy models.
        """
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
    """
    Response model for deletion operations.

    Attributes:
        message: A message confirming deletion.
        id: The identifier of the deleted object.
    """

    message: str
    id: UUID


class PromptRequest(BaseModel):
    prompt: str
    target_id: UUID | str

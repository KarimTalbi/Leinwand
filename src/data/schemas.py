import uuid
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ReadBase(BaseModel):
    """
    Base model for reading data.

    Attributes:
        id: The unique identifier.
    """

    id: UUID

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


class NodeRead(NodeBase, ReadBase):
    """
    Model for reading node data.

    Attributes:
        id: The unique identifier.
        type: The type of the node.
        pos_x: The horizontal position.
        pos_y: The vertical position.
        label: The label of the node.
        prompt: The input prompt.
        response: The generated response.
    """

    prompt: str | None = None
    response: str | None = None


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

    type: str | None = None
    pos_x: float | None = None
    pos_y: float | None = None
    label: str | None = None
    prompt: str | None = None
    response: str | None = None


class NodeCreate(NodeBase, CreateBase):
    """
    Model for creating node data.

    Attributes:
        id: The unique identifier.
        type: The type of the node.
        pos_x: The horizontal position.
        pos_y: The vertical position.
        label: The label of the node.
        prompt: The input prompt.
        response: The generated response.
    """

    prompt: str | None = None
    response: str | None = None


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

    source: UUID | None = None
    target: UUID | None = None


class CanvasRead(BaseModel):
    """
    Model for reading the entire canvas.

    Attributes:
        nodes: The list of nodes on the canvas.
        edges: The list of edges on the canvas.
    """

    nodes: list[NodeRead]
    edges: list[EdgeRead]


class DeleteResponse(BaseModel):
    """
    Response model for deletion operations.

    Attributes:
        message: A message confirming deletion.
        id: The identifier of the deleted object.
    """

    message: str
    id: UUID

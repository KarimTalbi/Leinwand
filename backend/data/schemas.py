"""
A module defining models for graph-like structures, including nodes and edges, and their interactions.

This module provides Pydantic-based models for managing the creation, update, and reading of graph
elements such as nodes and edges, as well as their associations within a canvas context.
"""
from uuid import UUID
from typing import Optional, List, Union

from pydantic import BaseModel, ConfigDict



class NodeBase(BaseModel):
    """
    Represents a base class for a node structure.

    This class serves as a foundational model for nodes, providing essential
    attributes for defining the type, position, and label of a node. It can
    be extended or used directly in various applications, such as graphical
    user interfaces, data structures, or graph-based systems.

    Attributes:
        type (str): The type or category of the node.
        pos_x (float): The x-coordinate of the node's position.
        pos_y (float): The y-coordinate of the node's position.
        label (str): A textual label or identifier for the node.
    """
    type: str
    pos_x: float
    pos_y: float
    label: str

class NodeCreate(NodeBase):
    """
    Represents a node creation model.

    This class is responsible for defining the attributes and structure
    required for creating a node. It inherits from the NodeBase class to
    ensure reusability and to maintain a consistent structure across
    different node-related models.

    Attributes:
        type (str): The type or category of the node.
        pos_x (float): The x-coordinate of the node's position.
        pos_y (float): The y-coordinate of the node's position.
        label (str): A textual label or identifier for the node.
    """
    pass

class NodeRead(NodeBase):
    """
    Represents a read-only node with attributes for storing an ID, a prompt, and a response.

    This class extends from NodeBase and is designed to represent a structured node
    that contains a unique identifier, an optional prompt, and an optional response.
    Primarily used for immutable or read-only scenarios where node data is represented
    but not intended to be modified. The `model_config` attribute determines how model
    instances are created and utilized in association with its attributes.

    Attributes:
        id (Union[UUID, str]): Unique identifier for the node.
        type (str): The type or category of the node.
        pos_x (float): The x-coordinate of the node's position.
        pos_y (float): The y-coordinate of the node's position.
        label (str): A textual label or identifier for the node.
        prompt (Optional[str]): The prompt or text associated with the node. Defaults to None.
        response (Optional[str]): The response or output corresponding to the prompt. Defaults to None.
    """
    id: Union[UUID, str]
    prompt: Optional[str] = None
    response: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class NodeUpdate(BaseModel):
    """
    Represents an update to a node with optional position, label, prompt, and response.

    This class is used for representing updates to a node in a system, such as updating
    its position, label, and associated data like prompts and responses. All attributes
    are optional, allowing for partial updates.

    Attributes:
        pos_x (Optional[float]): The x-coordinate position of the node.
        pos_y (Optional[float]): The y-coordinate position of the node.
        label (Optional[str]): The label or name of the node.
        prompt (Optional[str]): The prompt text associated with the node.
        response (Optional[str]): The response text associated with the node.
    """
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    label: Optional[str] = None
    prompt: Optional[str] = None
    response: Optional[str] = None

class EdgeBase(BaseModel):
    """
    Represents the base structure of an edge in a graph.

    This class serves as the foundational structure for modeling an edge in a
    graph, connecting a source node to a target node. It is designed to be
    extended or utilized as is, depending on the specific requirements of the
    graph implementation.

    Attributes:
        source (UUID): The unique identifier of the source node for this edge.
        target (UUID): The unique identifier of the target node for this edge.
    """
    source: UUID
    target: UUID

class EdgeCreate(EdgeBase):
    """
    Represents the creation of an edge in a graph structure.

    This class inherits from `EdgeBase` and encapsulates the functionality
    related to the creation of edges. It can be used in graph algorithms,
    database edge representations, or any system that deals with edge structures
    in a graph.

    Attributes:
        source (UUID): The unique identifier of the source node for this edge.
        target (UUID): The unique identifier of the target node for this edge.
    """
    pass

class EdgeRead(EdgeBase):
    """
    Represents an edge read operation within the graph data model.

    This class is a specific implementation of an edge element in a graph structure.
    It is designed to handle the reading and representation of edge data, integrating
    functionality provided by the EdgeBase class. The purpose of this class is to allow
    for efficient retrieval and management of edge-related data, ensuring compatibility
    with customizable configurations.

    Attributes:
        id (Union[UUID, str]): The unique identifier associated with the edge,
            represented either in UUID format or as a string.
        source (UUID): The unique identifier of the source node for this edge.
        target (UUID): The unique identifier of the target node for this edge.
    """
    id: Union[UUID, str]

    model_config = ConfigDict(from_attributes=True)

class EdgeUpdate(BaseModel):
    """
    Represents an edge update in a graph structure.

    This class is used to define the relationship between two nodes within
    a graph-based system. The `source` attribute represents the starting
    node of the edge, while the `target` attribute represents the ending node
    of the edge.

    Attributes:
        source (UUID): The unique identifier of the source node for the edge.
        target (UUID): The unique identifier of the target node for the edge.
    """
    source: UUID
    target: UUID

class CanvasRead(BaseModel):
    """
    Represents a canvas containing nodes and edges.

    This class is used as a data structure to store and manage a collection
    of nodes and edges, which collectively form a graphical representation
    of a canvas. It leverages Pydantic's BaseModel to ensure data validation
    and serialization.

    Attributes:
        nodes (List[NodeRead]): A collection of nodes that exist on the canvas.
        edges (List[EdgeRead]): A collection of edges that define the connections
            between nodes on the canvas.
    """
    nodes: List[NodeRead]
    edges: List[EdgeRead]

    model_config = ConfigDict(from_attributes=True)

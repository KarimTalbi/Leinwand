from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Base declarative class for SQLAlchemy models.

    This class serves as the base class for all SQLAlchemy ORM models using
    the declarative system. It inherits from `DeclarativeBase` and provides
    an organized structure for defining database models and relationships.

    Attributes:
        registry (registry): The metadata registry used across all models
            derived from this base class.
        metadata (MetaData): The SQLAlchemy `MetaData` instance that holds
            information about the database schema and is used for creating
            tables or reflecting existing structures.
    """

    ...


class Node(Base):
    """Represents a Node in the database.

    This class defines the structure and properties of a Node. It is designed
    to store data related to specific nodes, their type, position, and other
    associated information. Nodes can be used within specific applications
    to model hierarchical or network data, where attributes such as position
    and data are essential.

    Attributes:
        id (str): Unique identifier for the node. It is the primary key.
        type (str): Indicates the type of the node. Cannot be null.
        position (dict[str, float]): Specifies the position of the node, typically
            requiring numeric values for coordinates. Cannot be null.
        data (dict[str, Optional[str]]): Stores additional data or metadata
            about the node. Values can be either strings or null.
    """

    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    position: Mapped[dict[str, float]] = mapped_column(
        MutableDict.as_mutable(JSON), nullable=False
    )
    data: Mapped[dict[str, str | None]] = mapped_column(MutableDict.as_mutable(JSON))


class Edge(Base):
    """
    Represents an edge connecting two nodes in a graph.

    This class is a data model defining the structure of an edge entity in a graph.
    Each edge connects a source node to a target node, with optional additional
    information for specific connection points on the respective nodes.

    Attributes:
        id (str): Unique identifier for the edge.
        source (str): Unique identifier of the source node of the edge.
        target (str): Unique identifier of the target node of the edge.
        source_handle (str | None): Identifier for a specific connection point
            on the source node, if applicable.
        target_handle (str | None): Identifier for a specific connection point
            on the target node, if applicable.
    """

    __tablename__ = "edges"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    source: Mapped[str] = mapped_column(
        ForeignKey("nodes.id"), index=True, nullable=False
    )
    target: Mapped[str] = mapped_column(
        ForeignKey("nodes.id"), index=True, nullable=False
    )
    source_handle: Mapped[str | None] = mapped_column(String, nullable=True)
    target_handle: Mapped[str | None] = mapped_column(String, nullable=True)

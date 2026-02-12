"""
This module defines a database schema for a graph representation, including nodes and edges.

The module provides the `Node` and `Edge` classes, both inheriting from a shared `Base` class.
Nodes represent entities with spatial information and optional textual data, while edges represent
relationships between the nodes. The schema is built using SQLAlchemy and supports UUID primary
keys for unique identification of records.
"""
import uuid
from typing import Optional

from sqlalchemy import ForeignKey, Float, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID


class Base(DeclarativeBase):
    """
    Base class for database models using SQLAlchemy declarative base.

    This class serves as a foundation for defining database models. It implements a
    unified way to define common properties such as an ID column, which is used as
    the primary key. The ID is a universally unique identifier (UUID) that is auto-
    generated and indexed, ensuring efficient lookups.

    Attributes:
        id (uuid.UUID): The unique identifier for each record in the database.
            It is the primary key of the table.
    """
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )


class Node(Base):
    """
    Represents a node in a graph or network.

    This class serves as a model for a node entity, capturing its type, position,
    label, and optional text-based attributes like a prompt and response. It is
    designed to handle various use cases where nodes are required to have structured
    and meaningful metadata.

    Attributes:
        id (uuid.UUID): The unique identifier for each record in the database.
            It is the primary key of the table.
        type (str): The type or category of the node.
        pos_x (float): The x-coordinate of the node's position.
        pos_y (float): The y-coordinate of the node's position.
        label (str): The label or identifier associated with the node.
        prompt (Optional[str]): An optional textual prompt tied to the node, if any.
        response (Optional[str]): An optional textual response tied to the node, if any.
    """
    __tablename__ = "nodes"

    type: Mapped[str] = mapped_column(String(255))
    pos_x: Mapped[float] = mapped_column(Float)
    pos_y: Mapped[float] = mapped_column(Float)
    label: Mapped[str] = mapped_column(String(255))
    prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Edge(Base):
    """
    Represents a directed edge between two nodes in a graph.

    This class models the concept of an edge in a graph data structure. An edge is
    defined by its source and target nodes, represented as UUIDs. The edges are
    stored in a relational database table, and their references are linked to a
    separate table of nodes.

    Attributes:
        id (uuid.UUID): The unique identifier for each record in the database.
            It is the primary key of the table.
        source (uuid.UUID): The unique identifier of the source node for this edge.
            This field references the "id" attribute in the "nodes" table and is
            indexed for faster lookup.
        target (uuid.UUID): The unique identifier of the target node for this edge.
            This field references the "id" attribute in the "nodes" table and is
            indexed for faster lookup.
    """
    __tablename__ = "edges"

    source: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("nodes.id", ondelete="CASCADE"),
        index=True
    )

    target: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("nodes.id", ondelete="CASCADE"),
        index=True
    )

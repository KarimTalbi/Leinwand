"""
Module for defining database models related to a graph structure.
"""
import uuid
from typing import Optional

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """
    Base class for database models.

    Attributes:
        id: The unique identifier (primary key).
    """
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), index=True
    )


class Node(Base):
    """
    Represents a node in the graph.

    Attributes:
        id: The unique identifier (inherited).
        type: The type of the node.
        pos_x: The horizontal position.
        pos_y: The vertical position.
        label: The label of the node.
        prompt: The input prompt (optional).
        response: The generated response (optional).
        outgoing_edges: Edges where this node is the source.
        incoming_edges: Edges where this node is the target.
    """
    __tablename__ = "nodes"

    type: Mapped[str] = mapped_column(String(255))
    pos_x: Mapped[float] = mapped_column(Float)
    pos_y: Mapped[float] = mapped_column(Float)
    label: Mapped[str] = mapped_column(String(255))
    prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    outgoing_edges: Mapped[list["Edge"]] = relationship(
        "Edge", foreign_keys="[Edge.source]", back_populates="source_node"
    )
    incoming_edges: Mapped[list["Edge"]] = relationship(
        "Edge", foreign_keys="[Edge.target]", back_populates="target_node"
    )


class Edge(Base):
    """
    Represents a directed edge in the graph.

    Attributes:
        id: The unique identifier (inherited).
        source: The identifier of the source node.
        target: The identifier of the target node.
        source_node: The source node object.
        target_node: The target node object.
    """
    __tablename__ = "edges"

    source: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("nodes.id", ondelete="CASCADE"), index=True
    )

    target: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("nodes.id", ondelete="CASCADE"), index=True
    )

    source_node: Mapped["Node"] = relationship(
        "Node", foreign_keys=[source], back_populates="outgoing_edges"
    )
    target_node: Mapped["Node"] = relationship(
        "Node", foreign_keys=[target], back_populates="incoming_edges"
    )

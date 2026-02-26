import uuid
from typing import Optional

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), index=True
    )


class Node(Base):
    __tablename__ = "nodes"

    type: Mapped[str] = mapped_column(String(255))
    pos_x: Mapped[float] = mapped_column(Float)
    pos_y: Mapped[float] = mapped_column(Float)
    label: Mapped[str] = mapped_column(String(255))
    prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    outgoing_edges: Mapped[list["Edge"]] = relationship(
        "Edge", foreign_keys="[Edge.source_id]", back_populates="source_node"
    )
    incoming_edges: Mapped[list["Edge"]] = relationship(
        "Edge", foreign_keys="[Edge.target_id]", back_populates="target_node"
    )


class Edge(Base):
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

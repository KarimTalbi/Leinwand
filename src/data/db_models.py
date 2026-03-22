import uuid

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase): ...


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String())
    position: Mapped[dict[str, float]] = mapped_column(MutableDict.as_mutable(JSON))
    data: Mapped[dict[str, str | None]] = mapped_column(MutableDict.as_mutable(JSON))


class Edge(Base):
    __tablename__ = "edges"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, index=True)
    source: Mapped[uuid.UUID] = mapped_column(ForeignKey("nodes.id"), index=True)
    target: Mapped[uuid.UUID] = mapped_column(ForeignKey("nodes.id"), index=True)
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import ForeignKey, String, func, text
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP, UUID
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class PrimaryKeyMixin:
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )


class CreatedMixin:
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )


class AuditMixin(CreatedMixin):
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Base(DeclarativeBase): ...


class User(Base, AuditMixin, PrimaryKeyMixin):

    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String, index=True, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    disabled: Mapped[bool] = mapped_column(default=False)

    canvases: Mapped[list["Canvas"]] = relationship(back_populates="user")


class Node(Base, AuditMixin, PrimaryKeyMixin):

    __tablename__ = "nodes"

    canvas_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("canvas.id"), index=True)
    type: Mapped[str] = mapped_column(String, index=True)
    position: Mapped[dict[str, float]] = mapped_column(MutableDict.as_mutable(JSONB))
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))

    canvas: Mapped["Canvas"] = relationship(back_populates="nodes")


class Edge(Base, AuditMixin, PrimaryKeyMixin):

    __tablename__ = "edges"

    canvas_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("canvas.id"), index=True)
    source: Mapped[uuid.UUID] = mapped_column(ForeignKey("nodes.id"), index=True)
    target: Mapped[uuid.UUID] = mapped_column(ForeignKey("nodes.id"), index=True)
    source_handle: Mapped[str | None] = mapped_column(String)
    target_handle: Mapped[str | None] = mapped_column(String)

    canvas: Mapped["Canvas"] = relationship(back_populates="edges")


class Canvas(Base, AuditMixin, PrimaryKeyMixin):
    __tablename__ = "canvas"

    name: Mapped[str] = mapped_column(String)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))

    user: Mapped[User] = relationship(back_populates="canvases")
    nodes: Mapped[list["Node"]] = relationship(back_populates="canvas")
    edges: Mapped[list["Edge"]] = relationship(back_populates="canvas")

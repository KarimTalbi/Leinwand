from datetime import datetime
from typing import Any

from sqlalchemy import ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class CreatedMixin:
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )


class AuditMixin(CreatedMixin):
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Base(DeclarativeBase): ...


class Node(Base, AuditMixin):

    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    canvas_id: Mapped[str] = mapped_column(ForeignKey("canvas.id"), index=True)
    type: Mapped[str] = mapped_column(String, index=True)
    position: Mapped[dict[str, float]] = mapped_column(MutableDict.as_mutable(JSONB))
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))


class Edge(Base, AuditMixin):

    __tablename__ = "edges"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    canvas_id: Mapped[str] = mapped_column(ForeignKey("canvas.id"), index=True)
    source: Mapped[str] = mapped_column(ForeignKey("nodes.id"), index=True)
    target: Mapped[str] = mapped_column(ForeignKey("nodes.id"), index=True)
    source_handle: Mapped[str | None] = mapped_column(String)
    target_handle: Mapped[str | None] = mapped_column(String)


class User(Base, AuditMixin):

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, index=True, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    disabled: Mapped[bool] = mapped_column(default=False)


class Canvas(Base, AuditMixin):
    __tablename__ = "canvas"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))


class CanvasSnapshot(Base, CreatedMixin):
    __tablename__ = "canvas_snapshot"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    canvas_id: Mapped[str] = mapped_column(ForeignKey("canvas.id"), index=True)
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))

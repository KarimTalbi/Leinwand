from typing import Any

from sqlalchemy import ForeignKey, String, BigInteger
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase): ...


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, index=True, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    disabled: Mapped[bool] = mapped_column(default=False)


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    canvas_id: Mapped[str] = mapped_column(ForeignKey("canvas.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    type: Mapped[str] = mapped_column(String, index=True)
    position: Mapped[dict[str, float | int]] = mapped_column(MutableDict.as_mutable(JSONB))
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))


class Edge(Base):
    __tablename__ = "edges"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    canvas_id: Mapped[str] = mapped_column(ForeignKey("canvas.id"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    source: Mapped[str] = mapped_column(ForeignKey("nodes.id"), index=True)
    target: Mapped[str] = mapped_column(ForeignKey("nodes.id"), index=True)
    source_handle: Mapped[str | None] = mapped_column(String)
    target_handle: Mapped[str | None] = mapped_column(String)


class Canvas(Base):
    __tablename__ = "canvas"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    updated_at: Mapped[int] = mapped_column(BigInteger)
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))


class ApiKey(Base):
    __tablename__ = "api_key"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    key: Mapped[str] = mapped_column(String)
    models: Mapped[list[str] | None] = mapped_column(MutableDict.as_mutable(JSONB))
    model_provider: Mapped[str | None] = mapped_column(String)

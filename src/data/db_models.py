from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase): ...


class Node(Base):

    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    position: Mapped[dict[str, float]] = mapped_column(
        MutableDict.as_mutable(JSON), nullable=False
    )
    data: Mapped[dict[str, str | None]] = mapped_column(MutableDict.as_mutable(JSON))


class Edge(Base):

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


class User(Base):

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String, nullable=False, index=True, unique=True
    )
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    disabled: Mapped[bool] = mapped_column(default=False)

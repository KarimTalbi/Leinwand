"""
This module defines the SQLAlchemy database models for the application.

It includes models for:
- Users: Stores user authentication and profile data.
- Nodes: Represents nodes in the canvas (e.g., UI elements or data points).
- Edges: Represents connections between nodes in the canvas.
- Canvas: Stores the overall canvas metadata and data.
- ApiKey: Manages API keys associated with users for different model providers.
"""
from typing import Any

from sqlalchemy import ForeignKey, String, BigInteger, ARRAY, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""
    ...


class User(Base):
    """
    Represents a user in the system.

    Attributes:
        id (str): Unique identifier for the user.
        username (str): Unique username for the user.
        hashed_password (str): Hashed password for authentication.
        disabled (bool): Flag indicating if the user account is disabled.
        user_data (dict | None): Additional user-specific data stored as JSON.
    """
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, index=True, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)
    disabled: Mapped[bool] = mapped_column(default=False)
    user_data: Mapped[dict[str, Any] | None] = mapped_column(MutableDict.as_mutable(JSONB))


class Canvas(Base):
    """
    Represents a workspace or canvas containing nodes and edges.

    Attributes:
        id (str): Unique identifier for the canvas.
        name (str): Name or title of the canvas.
        user_id (str): Foreign key referencing the user who owns this canvas.
        updated_at (int): Timestamp of the last update.
        data (dict): Additional canvas-specific data or state stored as JSON.
    """
    __tablename__ = "canvas"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    updated_at: Mapped[int] = mapped_column(BigInteger)
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))


class Node(Base):
    """
    Represents a node within a canvas.

    Attributes:
        id (str): Unique identifier for the node.
        canvas_id (str): Foreign key referencing the canvas this node belongs to.
        user_id (str): Foreign key referencing the user who owns this node.
        type (str): Type of the node (e.g., 'llm', 'text', 'input').
        position (dict): X and Y coordinates of the node on the canvas.
        data (dict): Node-specific data and configuration stored as JSON.
    """
    __tablename__ = "nodes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    canvas_id: Mapped[str] = mapped_column(ForeignKey("canvas.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String, index=True)
    position: Mapped[dict[str, float | int]] = mapped_column(MutableDict.as_mutable(JSONB))
    data: Mapped[dict[str, Any]] = mapped_column(MutableDict.as_mutable(JSONB))


class Edge(Base):
    """
    Represents an edge connecting two nodes in a canvas.

    Attributes:
        id (str): Unique identifier for the edge.
        canvas_id (str): Foreign key referencing the canvas this edge belongs to.
        user_id (str): Foreign key referencing the user who owns this edge.
        source (str): Foreign key referencing the source node ID.
        target (str): Foreign key referencing the target node ID.
        source_handle (str | None): Optional identifier for the specific output handle on the source node.
        target_handle (str | None): Optional identifier for the specific input handle on the target node.
    """
    __tablename__ = "edges"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    canvas_id: Mapped[str] = mapped_column(ForeignKey("canvas.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    source: Mapped[str] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"), index=True)
    target: Mapped[str] = mapped_column(ForeignKey("nodes.id", ondelete="CASCADE"), index=True)
    source_handle: Mapped[str | None] = mapped_column(String)
    target_handle: Mapped[str | None] = mapped_column(String)





class ApiKey(Base):
    """
    Represents an API key for external services (like LLM providers).

    Attributes:
        id (str): Unique identifier for the API key entry.
        user_id (str): Foreign key referencing the user who owns this API key.
        key (str): The actual API key string.
        models (list[str] | None): List of models this key has access to or is restricted to.
        model_provider (str | None): Name of the provider for this API key (e.g., 'openai', 'anthropic').
    """
    __tablename__ = "api_key"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    key: Mapped[str] = mapped_column(String)
    models: Mapped[list[str] | None] = mapped_column(ARRAY(Text), default=list)
    model_provider: Mapped[str | None] = mapped_column(String)

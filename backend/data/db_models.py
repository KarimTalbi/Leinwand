from typing import List, Optional, Dict, Text
from sqlmodel import Field, SQLModel


class Node(SQLModel, table=True):
    __tablename__ = "nodes"
    id: str = Field(primary_key=True)
    type: str
    pos_x: float
    pos_y: float
    label: str

    prompt: Optional[str] = None
    response: Optional[str] = None


class Edge(SQLModel, table=True):
    __tablename__ = "edges"
    id: str = Field(primary_key=True)
    source: str = Field(foreign_key="nodes.id", ondelete="CASCADE")
    target: str = Field(foreign_key="nodes.id", ondelete="CASCADE")
    animated: bool = False


class CanvasState(SQLModel):
    nodes: List[Dict]
    edges: List[Dict]
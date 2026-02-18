from uuid import UUID
from typing import Optional, List, Union, Dict

from pydantic import BaseModel, ConfigDict, Field


class NodeBase(BaseModel):
    type: str
    pos_x: float
    pos_y: float
    label: str


class NodeCreate(BaseModel):
    type: str
    pos_x: float
    pos_y: float
    label: str


class NodeRead(BaseModel):
    id: Union[UUID, str]
    type: str
    pos_x: float
    pos_y: float
    label: str
    prompt: Optional[str] = None
    response: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class NodeUpdate(BaseModel):
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    label: Optional[str] = None
    prompt: Optional[str] = None
    response: Optional[str] = None


class NodeMap(BaseModel):
    nodes: Dict[str, NodeRead]

    @classmethod
    def from_list(cls, node_list: List[NodeRead]):
        return cls(nodes={str(node.id): node for node in node_list})

    def __getitem__(self, node_id: str) -> NodeRead:
        return self.nodes[node_id]

    def __iter__(self):
        return iter(self.nodes.values())

    @property
    def ids(self):
        return list(self.nodes.keys())


class EdgeBase(BaseModel):
    source: UUID
    target: UUID


class EdgeCreate(BaseModel):
    source: UUID
    target: UUID


class EdgeRead(BaseModel):
    id: Union[UUID, str]
    source: UUID
    target: UUID

    model_config = ConfigDict(from_attributes=True)


class EdgeUpdate(BaseModel):
    source: UUID
    target: UUID


class EdgeMap(BaseModel):
    edges: Dict[str, EdgeRead]

    @classmethod
    def from_list(cls, edge_list: List[EdgeRead]):
        return cls(edges={str(edge.id): edge for edge in edge_list})

    def __getitem__(self, edge_id: str) -> EdgeRead:
        return self.edges[edge_id]

    def __iter__(self):
        return iter(self.edges.values())

    @property
    def ids(self):
        return list(self.edges.keys())

    @property
    def links(self):
        return [(str(edge.source), str(edge.target)) for edge in self.edges.values()]


class CanvasRead(BaseModel):
    nodes: List[NodeRead] = Field(default_factory=list)
    edges: List[EdgeRead] = Field(default_factory=list)

    @property
    def node_map(self):
        return NodeMap.from_list(self.nodes)

    @property
    def edge_map(self):
        return EdgeMap.from_list(self.edges)

    model_config = ConfigDict(from_attributes=True)

class CanvasUpdate(CanvasRead):
    pass

from uuid import UUID
from typing import Optional, List, Dict, Generic

from pydantic import BaseModel, ConfigDict, Field
from data import R


class BaseCreate(BaseModel): ...


class BaseUpdate(BaseModel): ...


class BaseRead(BaseModel):
    id: UUID | str

    model_config = ConfigDict(from_attributes=True)


class NodeBase(BaseModel):
    type: str
    pos_x: float
    pos_y: float
    label: str


class NodeCreate(NodeBase, BaseCreate): ...


class NodeRead(NodeBase, BaseRead):
    prompt: Optional[str] = None
    response: Optional[str] = None


class NodeUpdate(BaseUpdate):
    type: Optional[str] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    label: Optional[str] = None
    prompt: Optional[str] = None
    response: Optional[str] = None


class EdgeBase(BaseModel):
    source: UUID
    target: UUID


class EdgeCreate(EdgeBase, BaseCreate): ...


class EdgeRead(EdgeBase, BaseRead): ...


class EdgeUpdate(BaseUpdate):
    source: Optional[UUID] = None
    target: Optional[UUID] = None


class CanvasRead(BaseModel):
    nodes: List[NodeRead]
    edges: List[EdgeRead]

    @property
    def node_map(self):
        return NodeMap.from_list(self.nodes)

    @property
    def node_ids(self):
        return self.node_map.ids

    def get_node(self, node_id: str) -> NodeRead:
        return self.node_map[node_id]

    @property
    def edge_map(self):
        return EdgeMap.from_list(self.edges)

    @property
    def edge_ids(self):
        return self.edge_map.ids

    def get_edge(self, edge_id: str) -> EdgeRead:
        return self.edge_map[edge_id]

    @property
    def edge_links(self):
        return self.edge_map.links

    model_config = ConfigDict(from_attributes=True)


class BaseMap(BaseModel, Generic[R]):
    items: dict[str, R]

    @classmethod
    def from_list(cls, item_list: list[R]):
        return cls(items={str(i.id): i for i in item_list})

    def __getitem__(self, item_id: str) -> R:
        return self.items[item_id]

    def __iter__(self):
        return iter(self.items.values())

    @property
    def ids(self):
        return list(self.items.keys())


class NodeMap(BaseMap[NodeRead]):
    items: Dict[str, NodeRead]


class EdgeMap(BaseMap[EdgeRead]):
    edges: Dict[str, EdgeRead]

    @property
    def links(self):
        return [(e.source, e.target) for e in list(self.edges.values())]

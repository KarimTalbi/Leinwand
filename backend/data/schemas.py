from pydantic import BaseModel
from typing import List, Optional


class ReactFlowNodeData(BaseModel):
    label: str
    prompt: Optional[str]
    response: Optional[str]


class ReactFlowNodePosition(BaseModel):
    x: float
    y: float


class ReactFlowNode(BaseModel):
    id: str
    type: str
    position: ReactFlowNodePosition
    data: ReactFlowNodeData

    @classmethod
    def format_node(cls, node):
        return cls(
            id=node.id,
            type=node.type,
            position=ReactFlowNodePosition(x=node.pos_x, y=node.pos_y),
            data=ReactFlowNodeData(label=node.label, prompt=node.prompt, response=node.response)
        )

    @classmethod
    def format_nodes(cls, nodes):
        return [cls.format_node(n) for n in nodes]


class ReactFlowEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = False

    @classmethod
    def format_edge(cls, edge):
        return cls(
            id=edge.id,
            source=edge.source,
            target=edge.target,
            animated=edge.animated
        )

    @classmethod
    def format_edges(cls, edges):
        return [cls.format_edge(e) for e in edges]


class CanvasResponse(BaseModel):
    nodes: List[ReactFlowNode]
    edges: List[ReactFlowEdge]

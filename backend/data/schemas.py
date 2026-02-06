from pydantic import BaseModel, Field
from typing import List, Dict, Any

class ReactFlowNodeData(BaseModel):
    label: str
    prompt: str
    response: str

class ReactFlowNodePosition(BaseModel):
    x: float
    y: float

class ReactFlowNode(BaseModel):
    id: str
    type: str
    data: ReactFlowNodeData
    position: ReactFlowNodePosition

class ReactFlowEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = False

class CanvasResponse(BaseModel):
    nodes: List[ReactFlowNode]
    edges: List[ReactFlowEdge]


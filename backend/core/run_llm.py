from typing import List
from uuid import UUID

from data import NodeRead, EdgeRead, NodeMap, EdgeMap
from llm_logic import graph


def get_context(nodes: List[NodeRead], edges: List[EdgeRead], target_id: str | UUID = None):
    nodes_ = NodeMap.from_list(nodes)
    edges_ = EdgeMap.from_list(edges)
    graph_ = graph.get_graph(nodes_, edges_, target_id)


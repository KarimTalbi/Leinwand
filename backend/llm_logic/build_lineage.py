from dataclasses import dataclass
from functools import cached_property
from typing import List
import networkx as nx
from uuid import UUID

from data import EdgeRead, NodeRead


@dataclass
class NodeFormat:
    node: NodeRead
    branches: List[str]
    is_target: bool

    def prompt(self) -> str:
        tag = " [TARGET] " if self.is_target else ""
        return f"{self.node.label}{tag}\n{self.node.prompt}"


@dataclass
class GraphNodes:
    nodes: List[NodeRead]

    def __post_init__(self):
        self.node_lookup = {n.id: n for n in self.nodes}
        self.ids = [n.id for n in self.nodes]


@dataclass
class GraphEdges:
    edges: List[EdgeRead]

    def __post_init__(self):
        self.edge_lookup = {e.id: e for e in self.edges}
        self.ids = [(e.source, e.target) for e in self.edges]


@dataclass
class GraphData:
    nodes: GraphNodes
    edges: GraphEdges
    target_id: str | UUID

    def __post_init__(self):
        self.target_id = str(self.target_id)
        self._full_graph = nx.DiGraph()
        self._full_graph.add_nodes_from(self.nodes.ids)
        self._full_graph.add_edges_from(self.edges.ids)

    @cached_property
    def lineage_ids(self):
        try:
            return nx.ancestors(self._full_graph, self.target_id) | {self.target_id}
        except nx.NetworkXError:
            return {self.target_id}

    @cached_property
    def context_graph(self):
        return self._full_graph.subgraph(self.lineage_ids)

    @cached_property
    def root_ids(self):
        return [n for n in self.context_graph.nodes if self.context_graph.in_degree(n) == 0]

    @cached_property
    def paths(self):
        p = []
        for root in self.root_ids:
            paths = list(nx.all_simple_paths(self.context_graph, root, self.target_id))
            p.extend(paths)
        return p

    @cached_property
    def branch_map(self):
        branches = {}
        for i, path in enumerate(self.paths):
            branch_id = f'Branch {i + 1}'
            for nid in path:
                if nid not in branches:
                    branches[nid] = []
                branches[nid].append(branch_id)
        return branches

    @cached_property
    def ordered_ids(self):
        return list(nx.topological_sort(self.context_graph))

    def get_formatted_nodes(self) -> List[NodeFormat]:
        """Final assembly: Merges GraphData with NodeFormat logic."""
        ordered_ids = list(nx.topological_sort(self.context_graph))

        return [
            NodeFormat(
                node=self.nodes.node_lookup[nid],
                branches=self.branch_map.get(nid, ["General"]),
                is_target=(nid == self.target_id),
            )
            for nid in ordered_ids
        ]

from dataclasses import dataclass
from uuid import UUID
from collections import defaultdict

import networkx as nx
from networkx import DiGraph
from typing import List
from data import NodeMap, EdgeMap, NodeRead


@dataclass
class ContextNode:
    node: NodeRead
    alias: str
    branches: List[str]
    parents: List[str]
    depth: int
    is_target: bool

    @property
    def format(self):
        prereqs = ", ".join(self.parents) if self.parents else 'None'
        streams = ", ".join(self.branches)
        tag = " [!!! Target !!!]" if self.is_target else ""
        return (
            f"### Node: {self.alias}{tag} (Pos: x={self.node.pos_x}, y={self.node.pos_y})\n"
            f" - Prerequisites: {prereqs}\n"
            f" - Logic Streams: {streams} | Level: {self.depth}\n"
            f" - Content:\n"
            f"   - User:\n{self.node.prompt}\n"
            f"   - AI-Assistant:\n{self.node.response or 'No previous response'}\n"
            f"{'-' * 50}\n"
        )


@dataclass
class ContextSummary:
    total_nodes: int
    total_streams: int
    max_depth: int
    target_alias: str

    @property
    def format(self):
        return (
            f"### Summary\n"
            f"Target Node: {self.target_alias}\n"
            f"Total Nodes in Lineage: {self.total_nodes}\n"
            f"Parallel Logic Streams: {self.total_streams}\n"
            f"Max Hierarchy Depth: {self.max_depth}\n"
            f"Structure: {'Linear' if self.total_streams == 1 else 'Branching/Parallel'}"
            f"{'-' * 50}\n"
        )


class Context:
    def __init__(self, nodes: NodeMap, edges: EdgeMap, target_id: str | UUID):
        self.node_map: NodeMap = nodes
        self.edge_map: EdgeMap = edges
        self.target_id: str = str(target_id)

        # build Full Graph
        self._full_graph: DiGraph = nx.DiGraph()
        self._full_graph.add_nodes_from(self.node_map.ids)
        self._full_graph.add_edges_from(self.edge_map.links)

        # Slice Subgraph
        lineage = nx.ancestors(self._full_graph, self.target_id) | {self.target_id}
        self.graph = nx.DiGraph(nx.subgraph(self._full_graph, lineage))

        # Sort and Alias
        self._order: list[str] = list(nx.topological_sort(self.graph))
        self._aliases: dict[str, str] = {nid: f"Node {i + 1}" for i, nid in enumerate(self._order)}

        # Metrics
        self._branches: dict[str, set[str]] = defaultdict(set)
        self._depths: dict[str, int] = defaultdict(int)

        self._process_graph_metrics()

    def _process_graph_metrics(self):
        roots = [n for n in self.graph.nodes if self.graph.in_degree(n) == 0]
        path_counter = 1

        for root in roots:
            # Calculate Depths (Max distance from any root)
            p_lengths = nx.shortest_path_length(self.graph, root)
            for nid, dist in p_lengths.items():
                self._depths[nid] = max(self._depths[nid], int(dist))

            paths = list(nx.all_simple_paths(self.graph, root, self.target_id))

            for path in paths:
                branch_name = f"Branch: {path_counter}"
                for nid in path:
                    self._branches[nid].add(branch_name)
                path_counter += 1

    def build_prompt(self) -> str:
        meta_instructions = (
            "SYSTEM INSTRUCTIONS:\n"
            "You are analyzing a Directed Acyclic Graph (DAG) representing a logic workflow.\n"
            "- NODES are provided in TOPOLOGICAL ORDER (logical sequence).\n"
            "- PREREQUISITES: Requirements that must be satisfied before the current node.\n"
            "- LOGIC STREAMS: Parallel paths; nodes in the same stream are part of a specific flow.\n"
            "- TARGET NODE: The specific node we are currently evaluating. Use its lineage to provide context.\n"
            "If a node has 'No previous response', it has not yet been executed in the workflow.\n"
            "- DO NOT apologize for \"inconsistencies\" or \"memory errors\" occurring across different branches. "
            "Understand that they were parallel paths.\n"
            f"{'=' * 50}\n\n"
        )

        summary = ContextSummary(
            total_nodes=len(self._order),
            total_streams=len({branch for streams in self._branches.values() for branch in streams}),
            max_depth=max(self._depths.values()) if self._depths else 0,
            target_alias=self._aliases[self.target_id]
        ).format

        sections = []
        for nid in self._order:
            sections.append(
                ContextNode(
                    node=self.node_map[nid],
                    alias=self._aliases[nid],
                    branches=sorted(list(self._branches[nid])),
                    parents=[self._aliases[p] for p in self.graph.predecessors(nid)],
                    depth=self._depths[nid],
                    is_target=(nid == self.target_id)
                ).format
            )

        return meta_instructions + summary + "\n".join(sections)

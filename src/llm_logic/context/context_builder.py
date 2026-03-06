from collections import defaultdict
from dataclasses import dataclass
from typing import Any, List
from uuid import UUID

import networkx as nx
from networkx import DiGraph

from data import CanvasRead, EdgeRead, NodeRead


@dataclass(frozen=True)
class ContextNode:
    """
    Represents a node within the context of a graph lineage.

    Attributes:
        node: The underlying node data.
        alias: A human-readable alias for the node.
        branches: The logic streams this node belongs to.
        parents: The aliases of the parent nodes.
        depth: The depth of the node in the hierarchy.
        is_target: Whether this node is the target of the context.
    """
    node: NodeRead
    alias: str
    branches: List[str]
    parents: List[str]
    depth: int
    is_target: bool

    def __format__(self, _) -> str:
        prereqs: str = ", ".join(self.parents) if self.parents else "None"
        streams: str = ", ".join(self.branches)
        tag: str = " [!!! Target !!!]" if self.is_target else ""
        return (
            f"### Node: {self.alias}{tag} (Pos: x={self.node.pos_x}, y={self.node.pos_y})\n"
            f" - Prerequisites: {prereqs}\n"
            f" - Logic Streams: {streams} | Level: {self.depth}\n"
            f" - Content:\n"
            f"   - User:\n{self.node.prompt}\n"
            f"   - AI-Assistant:\n{self.node.response or 'No previous response'}\n"
            f"{'-' * 50}\n"
        )

    def __str__(self) -> str:
        return self.__format__("")


@dataclass(frozen=True)
class ContextSummary:
    """
    Summary of the graph context lineage.

    Attributes:
        total_nodes: Total number of nodes in the lineage.
        total_streams: Total number of parallel logic streams.
        max_depth: Maximum depth of the hierarchy.
        target_alias: Alias of the target node.
    """
    total_nodes: int
    total_streams: int
    max_depth: int
    target_alias: str

    def __format__(self, _):
        return (
            f"### Summary\n"
            f"Target Node: {self.target_alias}\n"
            f"Total Nodes in Lineage: {self.total_nodes}\n"
            f"Parallel Logic Streams: {self.total_streams}\n"
            f"Max Hierarchy Depth: {self.max_depth}\n"
            f"Structure: {'Linear' if self.total_streams == 1 else 'Branching/Parallel'}"
            f"{'-' * 50}\n"
        )

    def __str__(self) -> str:
        return self.__format__("")


class Context:
    """
    Builder for generating a textual prompt from a graph context.

    Attributes:
        node_map: Mapping of node IDs to node data.
        edge_map: Mapping of edge IDs to edge data.
        target_id: The ID of the target node.
        graph: The subgraph representing the lineage of the target node.
    """
    def __init__(self, canvas: CanvasRead, target_id: UUID):
        """Initializes the context builder with canvas data and a target node."""
        self.node_map: dict[UUID, NodeRead] = {node.id: node for node in canvas.nodes}
        self.edge_map: dict[UUID, EdgeRead] = {edge.id: edge for edge in canvas.edges}
        self.target_id: UUID = target_id

        # build Full Graph
        self._full_graph: DiGraph[Any] = nx.DiGraph()
        self._full_graph.add_nodes_from([node for node in self.node_map])
        self._full_graph.add_edges_from(
            [(edge.source, edge.target) for edge in self.edge_map.values()]
        )

        # Slice Subgraph
        lineage: set[UUID] = nx.ancestors(self._full_graph, self.target_id) | {self.target_id}
        self.graph: DiGraph[Any] = nx.DiGraph(nx.subgraph(self._full_graph, lineage))

        # Sort and Alias
        self._order: list[UUID] = list(nx.topological_sort(self.graph))
        self._aliases: dict[UUID, str] = {nid: f"Node {i + 1}" for i, nid in enumerate(self._order)}

        # Metrics
        self._branches: dict[UUID, set[str]] = defaultdict(set)
        self._depths: dict[UUID, int] = defaultdict(int)

        self._process_graph_metrics()

    def _process_graph_metrics(self):
        """Calculates depths and logic streams for the subgraph."""
        roots: list[UUID] = [n for n in self.graph.nodes if self.graph.in_degree(n) == 0]
        path_counter: int = 1

        for root in roots:
            # Calculate Depths (Max distance from any root)
            p_lengths: dict[UUID, int] = nx.shortest_path_length(self.graph, root)
            for nid, dist in p_lengths.items():
                self._depths[nid] = max(self._depths[nid], int(dist))

            paths: list[list[UUID]] = list(nx.all_simple_paths(self.graph, root, self.target_id))

            for path in paths:
                branch_name = f"Branch: {path_counter}"
                for nid in path:
                    self._branches[nid].add(branch_name)
                path_counter += 1

    def build_prompt(self) -> str:
        """Generates the final textual prompt for the AI model."""

        summary: ContextSummary = ContextSummary(
            total_nodes=len(self._order),
            total_streams=len(
                {branch for streams in self._branches.values() for branch in streams}
            ),
            max_depth=max(self._depths.values()) if self._depths else 0,
            target_alias=self._aliases[self.target_id],
        )

        sections: list[str] = [f"{summary}"]
        for nid in self._order:
            node_data = ContextNode(
                node=self.node_map[nid],
                alias=self._aliases[nid],
                branches=sorted(list(self._branches[nid])),
                parents=[self._aliases[p] for p in self.graph.predecessors(nid)],
                depth=self._depths[nid],
                is_target=(nid == self.target_id),
            )
            sections.append(f"{node_data}")

        return "\n".join(sections)

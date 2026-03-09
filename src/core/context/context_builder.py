from collections import defaultdict
from dataclasses import dataclass, field
from uuid import UUID

import networkx as nx

from data import NodeRead


@dataclass
class Context:
    target_id: UUID
    node_map: dict[UUID, NodeRead]
    edge_links: list[tuple[UUID, UUID]]

    full_graph: nx.DiGraph[UUID] = field(init=False, default_factory=nx.DiGraph)
    graph: nx.DiGraph[UUID] | None = field(init=False, default=None)
    order: list[UUID] = field(init=False, default_factory=list)
    aliases: dict[UUID, str] = field(init=False, default_factory=dict)
    roots: list[UUID] = field(init=False, default_factory=list)
    depths: dict[UUID, int] = field(init=False, default_factory=lambda: defaultdict(int))
    branches: dict[UUID, list[str]] = field(init=False, default_factory=lambda: defaultdict(list))
    summary: str = field(init=False, default_factory=str)
    node_sections: list[str] = field(init=False, default_factory=list)
    prompt: str = field(init=False, default_factory=str)

    def __post_init__(self):
        if not self.node_map:
            raise ValueError("Cannot build context: node_map is empty")

        _get_full_graph(self)

        if self.target_id not in self.full_graph:
            raise KeyError(f"Target node {self.target_id} not found in the graph")

        _get_sub_graph(self)

        if self.graph is None or self.graph.number_of_nodes() == 0:
            raise RuntimeError("Graph is empty after subgraph selection")

        _get_order(self)
        _get_aliases(self)
        _get_roots(self)
        _get_depths(self)
        _get_branches(self)
        _get_summary(self)
        _get_node_sections(self)
        _get_prompt(self)


def _get_full_graph(ctx: Context) -> None:
    ctx.full_graph.add_nodes_from(ctx.node_map.keys())
    ctx.full_graph.add_edges_from(ctx.edge_links)


def _get_sub_graph(ctx: Context) -> None:
    lineage: set[UUID] = nx.ancestors(ctx.full_graph, ctx.target_id) | {ctx.target_id}
    ctx.graph = nx.DiGraph(ctx.full_graph.subgraph(lineage))


def _get_order(ctx: Context) -> None:
    ctx.order = list(nx.topological_sort(ctx.graph))


def _get_aliases(ctx: Context) -> None:
    ctx.aliases = {nid: f"Node {i + 1}" for i, nid in enumerate(ctx.order)}


def _get_roots(ctx: Context) -> None:
    ctx.roots = [n for n in ctx.graph.nodes if ctx.graph.in_degree(n) == 0]


def _get_depths(ctx: Context) -> None:
    for root in ctx.roots:
        p_lengths = nx.shortest_path_length(ctx.graph, root)
        for nid, dist in p_lengths.items():
            ctx.depths[nid] = max(ctx.depths[nid], int(dist))


def _get_branches(ctx: Context) -> None:
    for i, roots in enumerate(ctx.roots, 1):
        tag: str = f"Stream {i}"
        for nid in nx.descendants(ctx.graph, roots) | {roots}:
            ctx.branches[nid].append(tag)


def _get_summary(ctx: Context) -> None:
    ctx.summary = (
        f"### Summary\n"
        f"Target Node: {ctx.aliases[ctx.target_id]}\n"
        f"Total Nodes: {len(ctx.order)}\n"
        f"Logic Streams: {len(set(sum(ctx.branches.values(), [])))}\n"
        f"Max Depth: {max(ctx.depths.values()) if ctx.depths else 0}\n"
        f"{'-' * 50}"
    )


def _get_node_sections(ctx: Context) -> None:
    for nid in ctx.order:
        node = ctx.node_map[nid]
        parents = [ctx.aliases[p] for p in ctx.graph.predecessors(nid)]
        tag = " [!!! Target !!!]" if nid == ctx.target_id else ""

        ctx.node_sections.append(
            f"### Node: {ctx.aliases[nid]}{tag} (Pos: x={node.pos_x}, y={node.pos_y})\n"
            f" - Prerequisites: {', '.join(parents) if parents else 'None'}\n"
            f" - Logic Streams: {', '.join(ctx.branches[nid])} | Level: {ctx.depths[nid]}\n"
            f" - Content:\n"
            f"   - User:\n{node.prompt}\n"
            f"   - AI:\n{node.response if node.response else 'No response'}"
            f"{'-' * 50}\n"
        )


def _get_prompt(ctx: Context) -> None:
    ctx.prompt = ctx.summary + "\n".join(ctx.node_sections)

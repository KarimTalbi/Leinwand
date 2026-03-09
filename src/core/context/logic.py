from __future__ import annotations

from typing import TYPE_CHECKING, Callable
from uuid import UUID

import networkx as nx

if TYPE_CHECKING:
    from src.core.context.model import Context


PIPELINE: list[Callable[[Context], None]] = []


def step(func: Callable[[Context], None]) -> Callable[[Context], None]:
    PIPELINE.append(func)
    return func


@step
def _get_full_graph(ctx: Context) -> None:
    ctx.full_graph.add_nodes_from(ctx.node_map.keys())
    ctx.full_graph.add_edges_from(ctx.edge_links)


@step
def _get_sub_graph(ctx: Context) -> None:
    lineage: set[UUID] = nx.ancestors(ctx.full_graph, ctx.target_id) | {ctx.target_id}
    ctx.graph = nx.DiGraph(ctx.full_graph.subgraph(lineage))


@step
def _get_order(ctx: Context) -> None:
    ctx.order = list(nx.topological_sort(ctx.graph))


@step
def _get_aliases(ctx: Context) -> None:
    ctx.aliases = {nid: f"Node {i + 1}" for i, nid in enumerate(ctx.order)}


@step
def _get_roots(ctx: Context) -> None:
    ctx.roots = [n for n in ctx.graph.nodes if ctx.graph.in_degree(n) == 0]


@step
def _get_depths(ctx: Context) -> None:
    for root in ctx.roots:
        p_lengths = nx.shortest_path_length(ctx.graph, root)
        for nid, dist in p_lengths.items():
            ctx.depths[nid] = max(ctx.depths[nid], int(dist))


@step
def _get_branches(ctx: Context) -> None:
    for i, roots in enumerate(ctx.roots, 1):
        tag: str = f"Stream {i}"
        for nid in nx.descendants(ctx.graph, roots) | {roots}:
            ctx.branches[nid].append(tag)


def build_context(ctx: Context) -> None:
    if not ctx.node_map:
        raise ValueError("Cannot build context: node_map is empty")

    for func in PIPELINE:
        func(ctx)

        if step == _get_full_graph and (
            not ctx.full_graph or ctx.full_graph.number_of_nodes() == 0
        ):
            raise RuntimeError("Graph is empty")

        if step == _get_sub_graph and (
            not ctx.graph or ctx.graph.number_of_nodes() == 0
        ):
            raise RuntimeError("Subgraph is empty")

from __future__ import annotations

from typing import TYPE_CHECKING, Callable

from data.schemas import NodeData

if TYPE_CHECKING:
    from src.core.context.model import Context


PIPELINE: list[Callable[[Context], None]] = []


def step(func: Callable[[Context], None]) -> Callable[[Context], None]:
    PIPELINE.append(func)
    return func


@step
def _get_summary(ctx: Context) -> None:
    ctx.summary = (
        f"### Summary\n"
        f"Target Node: {ctx.aliases[ctx.target_id]}\n"
        f"Total Nodes: {len(ctx.order)}\n"
        f"Logic Streams: {len(set(sum(ctx.branches.values(), [])))}\n"
        f"Max Depth: {max(ctx.depths.values()) if ctx.depths else 0}\n"
        f"{'-' * 50}"
    )


@step
def _get_node_sections(ctx: Context) -> None:
    for nid in ctx.order:
        node = ctx.node_map[nid]
        parents = [ctx.aliases[p] for p in ctx.graph.predecessors(nid)]
        tag = " [!!! Target !!!]" if nid == ctx.target_id else ""

        ctx.node_sections.append(
            f"### Node: {ctx.aliases[nid]}{tag} (Pos: x={node.position.get('x')}, y={node.position.get('y')})\n"
            f" - Prerequisites: {', '.join(parents) if parents else 'None'}\n"
            f" - Logic Streams: {', '.join(ctx.branches[nid])} | Level: {ctx.depths[nid]}\n"
            f" - Content:\n"
            f"   - User:\n{node.data.prompt}\n"
            f"   - AI:\n{node.data.response}"
            f"{'-' * 50}\n"
        )


def build_prompt(ctx: Context) -> None:
    for func in PIPELINE:
        func(ctx)
    ctx.prompt = ctx.summary + "\n".join(ctx.node_sections)

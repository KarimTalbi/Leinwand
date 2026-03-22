from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Self
from uuid import UUID

import networkx as nx

if TYPE_CHECKING:
    from data import CanvasRead, NodeRead


@dataclass
class Context:
    target_id: UUID
    node_map: dict[UUID, NodeRead]
    edge_links: list[tuple[UUID, UUID]]

    full_graph: nx.DiGraph[UUID] | None = field(init=False, default=None)
    graph: nx.DiGraph[UUID] | None = field(init=False, default=None)
    order: list[UUID] = field(init=False, default_factory=list)
    aliases: dict[UUID, str] = field(init=False, default_factory=dict)
    roots: list[UUID] = field(init=False, default_factory=list)
    depths: dict[UUID, int] = field(
        init=False, default_factory=lambda: defaultdict(int)
    )
    branches: dict[UUID, list[str]] = field(
        init=False, default_factory=lambda: defaultdict(list)
    )
    summary: str = field(init=False, default_factory=str)
    node_sections: list[str] = field(init=False, default_factory=list)
    prompt: str = field(default="")

    @classmethod
    def from_canvas(cls, target_id: UUID, canvas: CanvasRead) -> Self:
        return cls(
            target_id=target_id,
            node_map={n.id: n for n in canvas.nodes},
            edge_links={(e.source, e.target) for e in canvas.edges},
        )

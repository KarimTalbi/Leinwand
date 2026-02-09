import heapq
from collections import defaultdict
from typing import List, Dict

from pydantic import BaseModel, PrivateAttr
from sqlmodel import Session, select

from data.db_session import get_db
from data.db_models import Node, Edge


class GraphContext(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

    _adj: Dict[str, List[str]] = PrivateAttr(default_factory=lambda: defaultdict(list))
    _parent_map: Dict[str, List[str]] = PrivateAttr(default_factory=lambda: defaultdict(list))
    _in_degree: Dict[str, int] = PrivateAttr(default_factory=dict)
    _out_degree: Dict[str, int] = PrivateAttr(default_factory=lambda: defaultdict(int))
    _node_map: Dict[str, Node] = PrivateAttr(default_factory=dict)

    _context_start: str = "--- START OF CANVAS CONTEXT ---\n\n"
    _context_end: str = "--- END OF CANVAS CONTEXT ---"
    _context_merge: str = ">>> MERGE POINT: The following node combines context from %s\n"
    _context_branch: str = "<<< BRANCH POINT: The conversation splits here into %s different paths.\n"
    _context_node: str = "### Node: %s (Pos: x=%d, y=%d)\n**User:** %s\n**AI Assistant:** %s\n"

    def model_post_init(self, __context):
        self._node_map = {node.id: node for node in self.nodes}
        self._in_degree = {node.id: 0 for node in self.nodes}

        for edge in self.edges:
            source, target = edge.source, edge.target
            if source in self._node_map and target in self._node_map:
                self._adj[source].append(target)
                self._parent_map[target].append(source)
                self._in_degree[target] += 1
                self._out_degree[source] += 1

    def topological_sort(self):
        temp_in_degree = self._in_degree.copy()

        queue = []
        for node_id, degree in temp_in_degree.items():
            if degree == 0:
                node = self._node_map[node_id]
                heapq.heappush(queue, (node.pos_y, node.pos_x, node_id))

        sorted_nodes = []

        while queue:
            y, x, u_id = heapq.heappop(queue)
            u_node = self._node_map[u_id]
            sorted_nodes.append(u_node)

            for v_id in self._adj[u_id]:
                temp_in_degree[v_id] -= 1
                if temp_in_degree[v_id] == 0:
                    v_node = self._node_map[v_id]
                    heapq.heappush(queue, (v_node.pos_y, v_node.pos_x, v_id))

        if len(sorted_nodes) != len(self.nodes):
            print(f"Warning: Cycle detected! Sorted {len(sorted_nodes)} out of {len(self.nodes)} nodes.")

        return sorted_nodes

    def build_context(self):
        sorted_nodes = self.topological_sort()
        context_str = self._context_start

        for node in sorted_nodes:
            node_id = node.id
            parents = self._parent_map[node_id]

            if len(parents) > 1:
                context_str += self._context_merge % ', '.join(parents)

            context_str += self._context_node % (node_id, node.pos_x, node.pos_y, node.prompt, node.response)

            if self._out_degree[node_id] > 1:
                context_str += self._context_branch % self._out_degree[node_id]

            context_str += "\n"

        context_str += self._context_end

        return context_str


def get_graph_data(current_node_id: str, session: Session = get_db()):
    base = (
        select(*Node.__table__.columns)
        .where(Node.id == current_node_id)
        .cte(recursive=True, name="ancestor_nodes")
    )

    recursion = (
        select(*Node.__table__.columns)
        .join(Edge, Node.id == Edge.source)
        .join(base, Edge.target == base.c.id)
    )

    ancestor_cte = base.union(recursion)

    stmt = select(ancestor_cte)
    results = session.execute(stmt).mappings().all()

    nodes = [Node.model_validate(row) for row in results]

    if not nodes:
        return [], []

    node_ids = [n.id for n in nodes]

    edge_stmt = select(Edge).where(
        Edge.source.in_(node_ids),
        Edge.target.in_(node_ids)
    )
    edges = session.exec(edge_stmt).all()

    return nodes, edges

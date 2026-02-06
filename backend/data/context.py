from collections import defaultdict, deque
from typing import List, Dict

from pydantic import BaseModel, PrivateAttr
from sqlmodel import Session, select
from sqlalchemy import select as sa_select

from db_session import get_db
from db_models import Node, Edge


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
    _context_node: str = "### Node: %s\n**User:** %s\n**AI Assistant:** %s\n"

    def model_post_init(self, __context):
        print("hello")
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
        queue = deque([node_id for node_id, degree in temp_in_degree.items() if degree == 0])
        sorted_nodes = []

        while queue:
            u = queue.popleft()
            sorted_nodes.append(self._node_map[u])
            for v in self._adj[u]:
                temp_in_degree[v] -= 1
                if temp_in_degree[v] == 0:
                    queue.append(v)

        return sorted_nodes

    def build_prompt(self):
        sorted_nodes = self.topological_sort()
        context_str = self._context_start

        for node in sorted_nodes:
            node_id = node.id
            parents = self._parent_map[node_id]

            if len(parents) > 1:
                context_str += self._context_merge % ', '.join(parents)

            context_str += self._context_node % (node_id, node.prompt, node.response)

            if self._out_degree[node_id] > 1:
                context_str += self._context_branch % self._out_degree[node_id]

            context_str += "\n"

        context_str += self._context_end

        return context_str


def build_cte(current_node_id: str):
    base = (
        select(Node.id, Node.type, Node.pos_x, Node.pos_y, Node.label, Node.prompt, Node.response)
        .where(Node.id == current_node_id)
        .cte(recursive=True, name="ancestor_nodes")
    )

    recursion = sa_select(
        Node.id, Node.type, Node.pos_x, Node.pos_y, Node.label, Node.prompt, Node.response
    ).join(
        Edge, Node.id == Edge.source
    ).join(
        base, Edge.target == base.c.id
    )

    ancestor_cte = base.union(recursion)

    return select(ancestor_cte)


def get_graph_data(current_node_id: str, session: Session):
    stmt = build_cte(current_node_id)

    result = session.execute(stmt)
    nodes = [dict(row) for row in result.mappings().all()]

    if not nodes:
        return [], []

    node_ids = [n["id"] for n in nodes]


    edge_stmt = select(Edge).where(
        Edge.source.in_(node_ids),
        Edge.target.in_(node_ids)
    )
    edge_objs = session.exec(edge_stmt).all()

    edges = [
        {"id": e.id, "source": e.source, "target": e.target, "animated": e.animated}
        for e in edge_objs
    ]

    return nodes, edges


nodes, edges = get_graph_data("node_1769770953700", get_db())
print(
    GraphContext(nodes=nodes, edges=edges).build_prompt()
)

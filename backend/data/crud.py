from sqlmodel import Session, select

from data import Node, Edge, get_db
from data import ReactFlowNode, ReactFlowEdge, CanvasResponse


class NodeData:

    @staticmethod
    def get_all(session: Session = get_db()):
        return session.exec(select(Node)).all()

    @staticmethod
    def get_where(whereclause, session: Session = get_db()):
        return session.exec(select(Node).where(*whereclause)).all()

    @staticmethod
    def delete_all():
        pass

    @staticmethod
    def get(node_id: str, session: Session = get_db()):
        return session.get(Node, node_id)

    @staticmethod
    def save():
        pass

    @staticmethod
    def update():
        pass

    @staticmethod
    def delete():
        pass


def get_edges(session: Session = get_db()):
    return session.exec(select(Edge)).all()


def get_edges_where(whereclause, session: Session = get_db()):
    return session.exec(select(Edge).where(*whereclause)).all()


def get_edge(edge_id: str, session: Session = get_db()):
    return session.get(Edge, edge_id)


def save_edge():
    pass


def update_edge():
    pass


def delete_edge():
    pass


def get_canvas_data(session: Session = get_db()):
    return CanvasResponse(
        nodes=ReactFlowNode.format_nodes(get_nodes(session)),
        edges=ReactFlowEdge.format_edges(get_edges(session))
    )


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

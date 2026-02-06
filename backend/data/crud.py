from sqlmodel import Session, select

from data.db_models import Node, Edge
from data.schemas import ReactFlowNode, ReactFlowEdge, CanvasResponse
from db_session import get_db


def get_nodes(session: Session = get_db()):
    return session.exec(select(Node)).all()


def get_node(node_id: str, session: Session = get_db()):
    return session.get(Node, node_id)


def get_nodes_where(whereclause, session: Session = get_db()):
    return session.exec(select(Node).where(*whereclause)).all()


def get_edges(session: Session = get_db()):
    return session.exec(select(Edge)).all()


def get_edge(edge_id: str, session: Session = get_db()):
    return session.get(Edge, edge_id)


def get_edges_where(whereclause, session: Session = get_db()):
    return session.exec(select(Edge).where(*whereclause)).all()


def get_canvas_data(session: Session = get_db()):
    return CanvasResponse(
        nodes=ReactFlowNode.format_nodes(get_nodes(session)),
        edges=ReactFlowEdge.format_edges(get_edges(session))
    )

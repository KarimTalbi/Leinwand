from collections import defaultdict, deque

from sqlalchemy import text
from sqlmodel import Session
from db_session import get_db




def build_multidimensional_context(nodes, edges):
    """
    Full context builder that identifies both Branching Points (one parent -> many children)
    and Merge Points (many parents -> one child).
    """
    adj = defaultdict(list)
    parent_map = defaultdict(list)
    in_degree = {node['id']: 0 for node in nodes}
    node_map = {node['id']: node for node in nodes}

    # Track how many children each node has to identify branching
    out_degree = defaultdict(int)

    for edge in edges:
        source, target = edge['source'], edge['target']
        if source in node_map and target in node_map:
            adj[source].append(target)
            parent_map[target].append(source)
            in_degree[target] += 1
            out_degree[source] += 1

    # Topological Sort
    queue = deque([n_id for n_id, degree in in_degree.items() if degree == 0])
    sorted_nodes = []
    while queue:
        u = queue.popleft()
        sorted_nodes.append(node_map[u])
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    # Construct the Prompt String
    context_str = "--- START OF CANVAS CONTEXT ---\n\n"
    context_str += "### Root Node:"
    for node in sorted_nodes:
        node_id = node['id']
        parents = parent_map[node_id]
        children_count = out_degree[node_id]

        # 1. MARKER: MERGE POINT (Multiple paths coming together)
        if len(parents) > 1:
            context_str += f">>> MERGE POINT: The following node combines context from: {', '.join(parents)}\n"

        # Standard Node Content
        context_str += f"### Node: {node_id}\n"
        context_str += f"**User:** {node['prompt']}\n"
        context_str += f"**AI Assistant:** {node['response']}\n"

        # 2. MARKER: BRANCH POINT (One path splitting into many)
        if children_count > 1:
            context_str += f"<<< BRANCH POINT: The conversation splits here into {children_count} different paths.\n"

        context_str += "\n"

    context_str += "--- END OF CANVAS CONTEXT ---"

    return context_str


def get_graph_data(current_node_id: str, session: Session):
    # This query gets all ancestors (nodes) AND the edges connecting them
    query = text("""
                 WITH RECURSIVE ancestor_nodes AS (
                     -- Base case: The node the user is currently interacting with
                     SELECT id, prompt, response
                     FROM nodes
                     WHERE id = :start_id
                     UNION
                     -- Recursive step: Find parents of the nodes already in our list
                     SELECT n.id, n.prompt, n.response
                     FROM nodes n
                              JOIN edges e ON n.id = e.source
                              JOIN ancestor_nodes an ON e.target = an.id)
                 SELECT *
                 FROM ancestor_nodes;
                 """)

    # Fetch nodes
    node_results = session.exec(query, params={"start_id": current_node_id}).all()
    # Convert list of tuples/rows to list of dicts
    nodes = [{"id": r.id, "prompt": r.prompt, "response": r.response} for r in node_results]

    # Fetch only the edges that exist between these specific ancestor nodes
    node_ids = [n["id"] for n in nodes]
    edge_query = text("SELECT source, target FROM edges WHERE source = ANY(:ids) AND target = ANY(:ids)")
    edge_results = session.exec(edge_query, params={"ids": node_ids}).all()
    edges = [{"source": e.source, "target": e.target} for e in edge_results]

    return nodes, edges


print(build_multidimensional_context(*get_graph_data("node_1769770953700", get_db())))
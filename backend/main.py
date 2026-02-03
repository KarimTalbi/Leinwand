import uvicorn
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, delete

from google import genai
from openai import OpenAI

from db_models import Node, Edge, CanvasState
from db_session import engine

load_dotenv()





app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conversation_history(node_id: str, session: Session) -> List[dict]:
    history = []
    current_id = node_id

    while current_id:
        node = session.get(Node, current_id)
        if not node:
            break

        if node.prompt:
            history.insert(0, {"role": "user", "content": node.prompt})
        if node.response:
            history.insert(0, {"role": "assistant", "content": node.response})

        edge = session.exec(select(Edge).where(Edge.target == current_id)).first()

        if edge:
            current_id = edge.source
        else:
            current_id = None

    return history


def get_session():
    with Session(engine) as session:
        yield session


def get_node_context(node_id: str, session: Session) -> List[Node]:
    """
    Recursively finds all ancestor nodes for a given node_id.
    Returns a list of Node objects in chronological order.
    """
    context_nodes = []
    current_id = node_id

    # Simple iterative trace-back (assumes a tree/branching structure)
    while current_id:
        # Find the edge where the current node is the 'target'
        edge = session.exec(
            select(Edge).where(Edge.target == current_id)
        ).first()

        if edge:
            # Find the parent node
            parent = session.get(Node, edge.source)
            if parent:
                context_nodes.insert(0, parent)  # Add to start of list
                current_id = parent.id
            else:
                break
        else:
            # No more parents found (reached a root node)
            break

    return context_nodes


@app.post("/save-canvas")
async def save_canvas(state: CanvasState, session: Session = Depends(get_session)):
    # 1. DELETE EVERYTHING (Edges first to avoid breaking constraints!)
    session.exec(delete(Edge))
    session.exec(delete(Node))

    # 2. INSERT ALL NODES FIRST
    for n in state.nodes:
        db_node = Node(
            id=n['id'],
            type=n['type'],
            pos_x=n['position']['x'],
            pos_y=n['position']['y'],
            label=n['data'].get('label', ''),
            prompt=n['data'].get('prompt', ''),
            response=n['data'].get('response', '')
        )
        session.add(db_node)

    # --- CRITICAL STEP ---
    # We "flush" the nodes to the DB so Postgres knows they exist,
    # but we haven't finished the transaction yet.
    session.flush()

    # 3. NOW INSERT THE EDGES
    for e in state.edges:
        db_edge = Edge(
            id=e['id'],
            source=e['source'],
            target=e['target'],
            animated=e.get('animated', False)
        )
        session.add(db_edge)

    # 4. FINALLY COMMIT EVERYTHING
    session.commit()
    return {"status": "synced"}


@app.get("/get-canvas")
async def get_canvas(session: Session = Depends(get_session)):
    nodes = session.exec(select(Node)).all()
    edges = session.exec(select(Edge)).all()

    # Format back to React Flow's expected nested structure
    return {
        "nodes": [
            {
                "id": n.id,
                "type": n.type,
                "position": {"x": n.pos_x, "y": n.pos_y},
                "data": {"label": n.label, "prompt": n.prompt, "response": n.response}
            } for n in nodes
        ],
        "edges": [
            {"id": e.id, "source": e.source, "target": e.target, "animated": e.animated}
            for e in edges
        ]
    }


@app.post("/run-node/{node_id}")
async def run_llm_node(node_id: str, session: Session = Depends(get_session)):
    # 1. Get the current node
    node = session.get(Node, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # 2. Trace history
    history = get_node_context(node_id, session)

    # 3. Format messages for the LLM
    messages = []

    for h_node in history:
        messages.append(f"user: {h_node.prompt}")
        if h_node.response:
            messages.append(f"assistant: {h_node.response}")

    # Add the current prompt
    messages.append(f"user: {node.prompt}")


    # 4. Call LLM
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-3-flash-preview", contents=messages
    )

    print(response.text)

    # 5. Save the result back to the database
    node.response = response.text
    session.add(node)
    session.commit()
    session.refresh(node)

    return {"id": node.id, "response": node.response}


# @app.post("/run-node/{node_id}")
# async def run_llm_node(node_id: str, session: Session = Depends(get_session)):
#     # 1. Get the current node
#     print(f"AI Endpoint hit for node: {node_id}") # Add this to debug!
#     node = session.get(Node, node_id)
#     if not node:
#         raise HTTPException(status_code=404, detail="Node not found")
#
#     # 2. Trace history
#     history = get_node_context(node_id, session)
#
#
#     # 3. Format messages for the LLM
#     messages = [{"role": "system", "content": "You are a helpful assistant. You're current conversation consists"
#                                               " of the following (if there is nothing, than the conversation "
#                                               "just started) USE THEM AS YOUR CONTEXT WHEN IT MAKES SENSE: "}]
#     for h_node in history:
#         messages.append({"role": "user", "content": h_node.prompt})
#         if h_node.response:
#             messages.append({"role": "assistant", "content": h_node.response})
#
#     messages.append({"role": "system", "content": "This is the current prompt: "})
#
#     # Add the current prompt
#     messages.append({"role": "user", "content": node.prompt})
#
#
#     # 4. Call LLM
#     client = OpenAI()
#     response = client.chat.completions.create(model="gpt-5-mini",
#     messages=messages)
#
#     print(response.choices[0].message.content)
#
#     # 5. Save the result back to the database
#     node.response = response.choices[0].message.content
#     session.add(node)
#     session.commit()
#     session.refresh(node)
#
#     return {"id": node.id, "response": node.response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

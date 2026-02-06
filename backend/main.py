from dotenv import load_dotenv
from collections import defaultdict, deque
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import delete, select, Session, text

from google import genai

from data.db_models import Node, Edge, CanvasState
from data.db_session import get_session, get_db
from data.crud import get_canvas_data, get_node

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return get_canvas_data(session)


@app.post("/run-node/{node_id}")
async def run_llm_node(node_id: str, session: Session = Depends(get_session)):
    # 1. Get the current node
    node = get_node(node_id, session)

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

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)

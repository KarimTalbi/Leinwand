import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import delete, Session

from data import Node, Edge, CanvasState, get_session, get_canvas_data, get_node
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
    session.exec(delete(Edge))
    session.exec(delete(Node))

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

    session.flush()

    for e in state.edges:
        db_edge = Edge(
            id=e['id'],
            source=e['source'],
            target=e['target'],
            animated=e.get('animated', False)
        )
        session.add(db_edge)

    session.commit()
    return {"status": "synced"}


@app.get("/get-canvas")
async def get_canvas(session: Session = Depends(get_session)):
    return get_canvas_data(session)


@app.post("/run-node/{node_id}")
async def run_llm_node(node_id: str, session: Session = Depends(get_session)):
    node = get_node(node_id, session)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    response = get_response(node.prompt, node_id)
    node.response = response
    session.add(node)
    session.commit()
    session.refresh(node)

    return {"id": node.id, "response": node.response}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

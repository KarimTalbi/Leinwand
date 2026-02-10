import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import delete, Session
import asyncio
from fastapi.responses import StreamingResponse

from data import Node, Edge, get_async_session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# @app.post("/save-canvas")
# async def save_canvas(state: CanvasState, session: Session = Depends(get_session)):
#     session.exec(delete(Edge))
#     session.exec(delete(Node))
#
#     for n in state.nodes:
#         db_node = Node(
#             id=n['id'],
#             type=n['type'],
#             pos_x=n['position']['x'],
#             pos_y=n['position']['y'],
#             label=n['data'].get('label', ''),
#             prompt=n['data'].get('prompt', ''),
#             response=n['data'].get('response', '')
#         )
#         session.add(db_node)
#
#     session.flush()
#
#     for e in state.edges:
#         db_edge = Edge(
#             id=e['id'],
#             source=e['source'],
#             target=e['target'],
#             animated=e.get('animated', False)
#         )
#         session.add(db_edge)
#
#     session.commit()
#     return {"status": "synced"}


# @app.get("/canvas")
# async def canvas(session: Session = Depends(get_async_session)):
#     pass


# @app.get("/nodes/{node_id}", response_model=ReadNode)
# async def get_node(
#         node_id: str,
#         session: Session = Depends(get_async_session)
# ):
#     service = NodeService(session)
#     node = await service.get(node_id)
#     if not node:
#         raise HTTPException(status_code=404, detail="Node not found")
#     return node


# @app.patch("/nodes/{node_id}/position")
# async def update_node_position(node_id: str, position: dict, session: Session = Depends(get_async_session)):
#     pass

# @app.get("/nodes/{node_id}/stream")
# async def stream_node_response(node_id: str):
#     async def fake_llm_generator():
#         words = "This is a streamed response from your async backend.".split()
#         for word in words:
#             yield f"{word}"
#             await asyncio.sleep(0.2)
#     return StreamingResponse(fake_llm_generator(), media_type="text/plain")


# @app.post("/run-node/{node_id}")
# async def run_llm_node(node_id: str, session: Session = Depends(get_session)):
#     node = get_node(node_id, session)
#     if not node:
#         raise HTTPException(status_code=404, detail="Node not found")
#
#     response = get_response(node.prompt, node_id)
#     node.response = response
#     session.add(node)
#     session.commit()
#     session.refresh(node)
#
#     return {"id": node.id, "response": node.response}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

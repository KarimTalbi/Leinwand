from data import NodeService, EdgeService, CanvasRead, Confirmation


async def load_canvas(
    node_service: NodeService, edge_service: EdgeService
) -> CanvasRead:

    nodes = await node_service.get()
    edges = await edge_service.get()

    return CanvasRead(nodes=nodes, edges=edges)


async def wipe_canvas(
    node_service: NodeService, edge_service: EdgeService
) -> Confirmation:

    await edge_service.clear()
    await node_service.clear()

    return Confirmation(message="Wiped successfully")


async def write_canvas(
    canvas: CanvasRead, node_service: NodeService, edge_service: EdgeService
) -> Confirmation:

    if canvas.nodes:
        await node_service.write(canvas.nodes)
        if canvas.edges:
            await edge_service.write(canvas.edges)

    return Confirmation(message="Saved successfully")


async def sync_canvas(
    canvas: CanvasRead, node_service: NodeService, edge_service: EdgeService
) -> Confirmation:

    await wipe_canvas(node_service, edge_service)
    await write_canvas(canvas, node_service, edge_service)

    return Confirmation(message="Synced successfully")

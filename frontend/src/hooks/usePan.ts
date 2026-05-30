import {useReactFlow, useStore, useViewport} from "@xyflow/react";

/** Exposes pan and zoom helpers for the canvas toolbar, including current zoom percentage. */
export const usePan = () => {
  const {zoom} = useViewport();
  const {getViewport, setViewport, zoomTo, screenToFlowPosition} = useReactFlow();

  const pan = (dx: number, dy: number) => {
    const {x, y, zoom} = getViewport()
    void setViewport({x: x + dx, y: y + dy, zoom})
  }

  const minZoom = useStore((state) => state.minZoom);
  const maxZoom = useStore((state) => state.maxZoom);
  const panAmount = useStore((state) => state.snapGrid[0])

  const zoomPercent = (100 * zoom).toFixed(0)

  const panUp = () => pan(0, panAmount);
  const panDown = () => pan(0, -1 * panAmount);
  const panLeft = () => pan(panAmount, 0);
  const panRight = () => pan(-1 * panAmount, 0);
  const panHome = () => setViewport({x: 0, y: 0, zoom: 1});

  const zoomIn = () => zoomTo(zoom + 0.1, {duration: 200});
  const zoomOut = () => zoomTo(zoom - 0.1, {duration: 200});

  const resetZoom = () => zoomTo(1, {duration: 200});


  return {
    panUp,
    panDown,
    panLeft,
    panRight,
    zoomIn,
    zoomOut,
    resetZoom,
    zoomTo,
    panHome,
    zoom,
    minZoom,
    maxZoom,
    zoomPercent,
    screenToFlowPosition
  }
}
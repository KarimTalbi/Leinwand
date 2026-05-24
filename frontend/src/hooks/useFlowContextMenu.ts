import React, {useCallback, useState} from "react";
import {useReactFlow, XYPosition} from "@xyflow/react";

interface ContextMenuState {
  screenX: number;
  screenY: number;
  flowPos: XYPosition;
  nodeId?: string;
}

export function useFlowContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const { screenToFlowPosition, setViewport } = useReactFlow();

  const closeMenu = useCallback(() => setMenu(null), []);

  const onPaneContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const raw = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setMenu({
        screenX: e.clientX,
        screenY: e.clientY,
        flowPos: {
          x: Math.round(raw.x / 300) * 300,
          y: raw.y,
        },
      });
    },
    [screenToFlowPosition],
  );

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: { id: string }) => {
      e.preventDefault();
      const raw = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setMenu({
        screenX: e.clientX,
        screenY: e.clientY,
        flowPos: {
          x: Math.round(raw.x / 300) * 300,
          y: raw.y,
        },
        nodeId: node.id,
      });
    },
    [screenToFlowPosition],
  );

  return { menu, setMenu, closeMenu, onPaneContextMenu, onNodeContextMenu, setViewport };
}
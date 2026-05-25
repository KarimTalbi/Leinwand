import React, {useCallback, useState} from "react";
import {useReactFlow, XYPosition} from "@xyflow/react";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {CustomButtonProps} from "@/components/ui/UiElements.tsx";
import {nodeTypeProperties} from "@/lib/styles.ts";
import {LucideHouse} from "lucide-react";
import {usePan} from "@/hooks/usePan.ts";

interface ContextMenuState {
  screenX: number;
  screenY: number;
  flowPos: XYPosition;
  nodeId?: string;
}

export function useFlowContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const { screenToFlowPosition, setViewport } = useReactFlow();
  const {addNode} = useStore(useShallow(s => ({addNode: s.addNode})))
  const {panHome} = usePan()

  const closeMenu = useCallback(() => setMenu(null), []);

  const handleAddPromptNode = () => {
    addNode("promptNode", menu?.flowPos)
    closeMenu()
  }

  const handleAddTextNode = () => {
    addNode("textNode", menu?.flowPos)
    closeMenu()
  }

  const handleAddSummaryNode = () => {
    addNode("summaryNode", menu?.flowPos)
    closeMenu()
  }

  const handleAddMergeNode = () => {
    addNode("mergeNode", menu?.flowPos)
    closeMenu()
  }


  const contextMenuGlobal: Partial<CustomButtonProps> = {
    className: "btn btn-ghost border-none justify-start gap-4",
    tooltipDisabled: true
  }

  const contextMenuButtons: CustomButtonProps[] = [
    {
      icon: nodeTypeProperties.promptNode.icon,
      iconProps: {color: nodeTypeProperties.promptNode.color},
      children: "Chat",
      onClick: handleAddPromptNode,
      ...contextMenuGlobal
    },
    {
      icon: nodeTypeProperties.textNode.icon,
      iconProps: {color: nodeTypeProperties.textNode.color},
      children: "Note",
      onClick: handleAddTextNode,
      ...contextMenuGlobal
    },
    {
      icon: nodeTypeProperties.summaryNode.icon,
      iconProps: {color: nodeTypeProperties.summaryNode.color},
      children: "Summary",
      onClick: handleAddSummaryNode,
      ...contextMenuGlobal
    },
    {
      icon: nodeTypeProperties.mergeNode.icon,
      iconProps: {color: nodeTypeProperties.mergeNode.color},
      children: "Merge",
      onClick: handleAddMergeNode,
      ...contextMenuGlobal
    }
  ]

  const viewportButton: CustomButtonProps = {
    icon: LucideHouse,
    children: "Go to center",
    onClick: panHome,
    ...contextMenuGlobal
  }


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

  const menuStyle = (() => {
    if (!menu) return {};
    const W = window.innerWidth;
    const H = window.innerHeight;
    const MENU_W = 200;
    const MENU_H = 250;
    return {
      top: menu.screenY + MENU_H > H ? menu.screenY - MENU_H : menu.screenY,
      left: menu.screenX + MENU_W > W ? menu.screenX - MENU_W : menu.screenX,
    };
  })();


  return { menu, setMenu, closeMenu, onPaneContextMenu, setViewport, menuStyle, contextMenuButtons, viewportButton};
}
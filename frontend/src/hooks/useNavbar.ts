import {CustomButtonProps} from "@/components/ui/UiElements.tsx";
import {navbarButtonStyle} from "@/lib/styles.ts";
import {LucideChevronLeft, LucideFolder, LucideHexagon, LucideSettings2, LucideSpline} from "lucide-react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";

const navbarCenterGlobal: Partial<CustomButtonProps> = {
  disabled: true,
  tooltipPosition: "bottom",
  className: navbarButtonStyle
}

const navbarEndGlobal: Partial<CustomButtonProps> = {
  tooltipDisabled: true,
  className: navbarButtonStyle
}

export const useNavbar = () => {
  const {currentCanvasName, nodeCount, edgeCount, exitCanvas} = useStore(useShallow(s => ({
    currentCanvasName: s.currentCanvasName,
    nodeCount: s.nodes.length,
    edgeCount: s.edges.length,
    exitCanvas: s.exitCanvas,
  })));

  const navbarCenterChild: CustomButtonProps[] = [
    {icon: LucideFolder, tooltipLabel: "Project Title", children: currentCanvasName, ...navbarCenterGlobal},
    {icon: LucideHexagon, tooltipLabel: "Node Count", children: nodeCount, ...navbarCenterGlobal},
    {icon: LucideSpline, tooltipLabel: "Edge Count", children: edgeCount, ...navbarCenterGlobal}
  ]

  const navbarEndChild: CustomButtonProps[] = [
    {icon: LucideChevronLeft, children: "Exit", onClick: exitCanvas, ...navbarEndGlobal},
    {
      icon: LucideSettings2, children: "Settings", onClick: () => {
      }, ...navbarEndGlobal
    }
  ]

  return {navbarCenterChild, navbarEndChild}
}








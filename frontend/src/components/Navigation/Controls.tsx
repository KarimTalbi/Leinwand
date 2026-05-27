import {Panel, useReactFlow} from '@xyflow/react'
import {
  LucideLockOpen, LucideLock, LucideMouseOff, LucideMouse, LucideZoomIn, LucideZoomOut, LucideArrowUp, LucideArrowDown,
  LucideArrowLeft, LucideArrowRight
} from 'lucide-react'
import useStore from "@/store.ts";
import {
  nodeTypeProperties,
} from "@/lib/styles.ts";
import {useShallow} from "zustand/react/shallow";
import {NodeTypeNames} from "@/types.ts";
import {ControlBarField, ControlBarFieldProps} from "@/components/ui/CustomButtons.tsx";
import {usePan} from "@/hooks/usePan.ts";


export const Controls = () => {
  const {screenToFlowPosition} = useReactFlow()
  const {panUp, panDown, panLeft, panRight, zoomOut, zoomIn} = usePan();

  const {locked, setLocked, scrollToZoom, setScrollToZoom, addNode} = useStore(useShallow((state) => ({
    locked: state.locked,
    setLocked: state.setLocked,
    scrollToZoom: state.scrollToZoom,
    setScrollToZoom: state.setScrollToZoom,
    addNode: state.addNode,
  })))


  const onCreateNode = async (type: NodeTypeNames) => {

    const position = screenToFlowPosition(
      {x: window.innerWidth / 2, y: window.innerHeight / 2}
    );
    addNode(type, position);
  }

  const lockButton = locked ? LucideLockOpen : LucideLock
  const lockTip = locked ? "Unlock Canvas" : "Lock Canvas"

  const scrollButton = scrollToZoom ? LucideMouseOff : LucideMouse
  const scrollTip = scrollToZoom ? "Disable scroll to zoom" : "Enable scroll to zoom"


  const lockControls: ControlBarFieldProps = {
    buttons: [
      {icon: lockButton, onClick: setLocked, tooltipLabel: lockTip, iconProps: {size: 12}},
      {icon: scrollButton, onClick: setScrollToZoom, tooltipLabel: scrollTip, iconProps: {size: 12}}
    ]
  }

  const zoomControls: ControlBarFieldProps = {
    buttons: [
      {icon: LucideZoomIn, onClick: zoomIn, tooltipLabel: "Zoom In", iconProps: {size: 12}},
      {icon: LucideZoomOut, onClick: zoomOut, tooltipLabel: "Zoom Out", iconProps: {size: 12}}
    ],
  }

  const panVerticalControls: ControlBarFieldProps = {
    buttons: [
      {icon: LucideArrowUp, onClick: panUp, tooltipLabel: "Pan Up", iconProps: {size: 12}},
      {icon: LucideArrowDown, onClick: panDown, tooltipLabel: "Pan Down", iconProps: {size: 12}}],
  }

  const panHorizontalControls: ControlBarFieldProps = {
    buttons: [
      {icon: LucideArrowLeft, onClick: panLeft, tooltipLabel: "Pan Left", iconProps: {size: 12}},
      {icon: LucideArrowRight, onClick: panRight, tooltipLabel: "Pan Right", iconProps: {size: 12}}
    ],
  }

  const openAddNodeMenu: ControlBarFieldProps = {
    buttons: [
      {
        icon: nodeTypeProperties.promptNode.icon,
        iconProps: {color: nodeTypeProperties.promptNode.color, size: 12},
        onClick: () => onCreateNode("promptNode"),
        tooltipLabel: "Add Chat Node",
      },
      {
        icon: nodeTypeProperties.textNode.icon,
        iconProps: {color: nodeTypeProperties.textNode.color, size: 12},
        onClick: () => onCreateNode("textNode"),
        tooltipLabel: "Add Note Node",
      },
      {
        icon: nodeTypeProperties.summaryNode.icon,
        iconProps: {color: nodeTypeProperties.summaryNode.color, size: 12},
        onClick: () => onCreateNode("summaryNode"),
        tooltipLabel: "Add Summary Node"
      },
      {
        icon: nodeTypeProperties.mergeNode.icon,
        iconProps: {color: nodeTypeProperties.mergeNode.color, size: 12},
        onClick: () => onCreateNode("mergeNode"),
        tooltipLabel: "Add Merge Node"
      }
    ],
  }

  return (
    <Panel position="bottom-center" className="flex flex-row gap-2">

      <ControlBarField className="grid-cols-2 shrink-0" {...lockControls}/>
      <ControlBarField className="grid-cols-2 shrink-0" {...zoomControls}/>
      <ControlBarField className="grid-cols-2 shrink-0" {...panVerticalControls}/>
      <ControlBarField className="grid-cols-2 shrink-0" {...panHorizontalControls}/>
      <ControlBarField className="grid-cols-4 shrink-0" {...openAddNodeMenu}/>

    </Panel>
  )
}
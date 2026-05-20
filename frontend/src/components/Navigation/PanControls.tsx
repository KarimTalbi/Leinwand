import {Panel, useReactFlow} from '@xyflow/react'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LockOpen,
  Lock,
  Mouse,
  MessagesSquare,
  LucideTextCursorInput, Minimize2, MergeIcon, X, Plus
} from 'lucide-react'
import useStore from "@/store.ts";
import {nodeColors, outerButtonStyle, tooltipStyle} from "@/lib/styles.ts";
import {cn} from "@/lib/utils.ts";
import {useShallow} from "zustand/react/shallow";
import {useState} from "react";
import {NodeTypeNames} from "@/types.ts";

const PAN_AMOUNT = 300

export const PanControls = () => {
  const {getViewport, setViewport, screenToFlowPosition} = useReactFlow()
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
  }

  const pan = (dx: number, dy: number) => {
    const {x, y, zoom} = getViewport()
    void setViewport({x: x + dx, y: y + dy, zoom})
  }

  return (
    <Panel position="bottom-center" className="flex flex-row gap-2">
      <div className="grid grid-cols-4 gap-1 bg-stone-200 p-1 rounded-full">

        <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Pan Up">
          <button className={cn(outerButtonStyle)} onClick={() => pan(0, PAN_AMOUNT)}>
            <ChevronUp size={14}/>
          </button>
        </div>

        <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Pan Up">
          <button className={cn(outerButtonStyle)} onClick={() => pan(PAN_AMOUNT, 0)}>
            <ChevronLeft size={14}/>
          </button>
        </div>

        <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Pan Up">
          <button className={cn(outerButtonStyle)} onClick={() => pan(-1 * PAN_AMOUNT, 0)}>
            <ChevronRight size={14}/>
          </button>
        </div>

        <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Pan Up">
          <button className={cn(outerButtonStyle)} onClick={() => pan(0, -1 * PAN_AMOUNT)}>
            <ChevronDown size={14}/>
          </button>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-1 bg-stone-200 p-1 rounded-full">

        <div className={cn(tooltipStyle, "tooltip-top")} data-tip={locked ? "Unlock Canvas" : "Lock Canvas"}>
          <button className={cn(outerButtonStyle)} onClick={() => setLocked(!locked)}>
            {locked ? <LockOpen size={14}/> : <Lock size={14}/>}
          </button>
        </div>

        <div className={cn(tooltipStyle, "tooltip-top")} data-tip={scrollToZoom ? "Disable Scroll Zoom" : "Enable Scroll Zoom"}>
          <button className={cn(outerButtonStyle)} onClick={() => setScrollToZoom(!scrollToZoom)}>
            <Mouse size={14}></Mouse>
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-1 bg-stone-200 p-1 rounded-full">
        {/* Overlay for closing the panel when clicking outside it */}
        {isOpen && (
          <div style={{position: 'fixed', inset: 0, zIndex: 100}} onMouseDown={() => setIsOpen(false)}/>
        )}

        {/* Open Button Menu */}
        <div className="relative flex items-center" style={{zIndex: 20}}>

          {/* Node Buttons */}
          {isOpen ? (
            <div>
              <div className="absolute bottom-full pb-1 flex flex-col gap-1">

                <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Chat">
                  <button onClick={() => onCreateNode("promptNode")} className={cn(outerButtonStyle)}>
                    <MessagesSquare  size={14} color={nodeColors.promptNode}/>
                  </button>
                </div>

                <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Note">
                  <button onClick={() => onCreateNode("textNode")} className={cn(outerButtonStyle)}>
                    <LucideTextCursorInput  size={14} color={nodeColors.textNode}/>
                  </button>
                </div>

                <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Summary">
                  <button onClick={() => onCreateNode("summaryNode")} className={cn(outerButtonStyle)}>
                    <Minimize2 className="rotate-45"  size={14} color={nodeColors.summaryNode}/>
                  </button>
                </div>

                <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Merge">
                  <button onClick={() => onCreateNode("mergeNode")} className={cn(outerButtonStyle, "mb-1")}>
                    <MergeIcon className="rotate-90"  size={14} color={nodeColors.mergeNode}/>
                  </button>
                </div>

              </div>

              {/* Close Button */}
              <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Close">
                <button onClick={() => setIsOpen(false)} className={cn(outerButtonStyle)}>
                  <X size={14}/>
                </button>
              </div>

            </div>

          ) : (

            // Open Button

            <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Add Node">
              <button onClick={() => setIsOpen(true)} className={cn(outerButtonStyle)}>
                <Plus size={14}/>
              </button>
            </div>
          )}

        </div>
      </div>

    </Panel>
  )
}
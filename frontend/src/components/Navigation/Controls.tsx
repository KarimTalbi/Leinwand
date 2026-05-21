import {Panel, useReactFlow, useViewport} from '@xyflow/react'
import {
  LockOpen,
  Lock,
  Mouse,
  MessagesSquare,
  LucideTextCursorInput, Minimize2, MergeIcon, X, Plus, ArrowUp, ArrowLeft, ArrowRight, ArrowDown, ZoomOut,
  ZoomIn, MouseOff
} from 'lucide-react'
import useStore from "@/store.ts";
import {nodeColors, outerButtonStyle, tooltipStyle} from "@/lib/styles.ts";
import {cn} from "@/lib/utils.ts";
import {useShallow} from "zustand/react/shallow";
import {useState} from "react";
import {NodeTypeNames} from "@/types.ts";

const PAN_AMOUNT = 300

export const Controls = () => {
  const {zoom} = useViewport();
  const {getViewport, setViewport, screenToFlowPosition, zoomTo} = useReactFlow()
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
    <div>

      {/* Overlay for closing the panel when clicking outside it */}
      {isOpen && (
        <div style={{position: 'fixed', inset: 0, zIndex: 10}} onMouseDown={() => setIsOpen(false)}/>
      )}

      <Panel position="bottom-center" className="flex flex-row gap-2 p-2" style={{zIndex: 20}}>

        <div className="grid grid-cols-2 bg-white rounded-full ring-1 ring-neutral-200 shadow-md p-1">

          <div className={cn(tooltipStyle, "tooltip-top")} data-tip={locked ? "Unlock Canvas" : "Lock Canvas"}>
            <button className={cn(outerButtonStyle)} onClick={() => setLocked(!locked)}>
              {locked ? <LockOpen size={14}/> : <Lock size={14}/>}
            </button>
          </div>

          <div className={cn(tooltipStyle, "tooltip-top")}
               data-tip={scrollToZoom ? "Disable scroll to zoom" : "Enable scroll to zoom"}>
            <button className={cn(outerButtonStyle)} onClick={() => setScrollToZoom(!scrollToZoom)}>
              {!scrollToZoom ? <Mouse size={14}></Mouse> : <MouseOff size={14}/>}
            </button>
          </div>

        </div>

        <div className="grid grid-cols-2 bg-white rounded-full ring-1 ring-neutral-200 shadow-md p-1">

          <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Zoom Out">
            <button className={cn(outerButtonStyle)} onClick={() => zoomTo(zoom - 0.1, {duration: 200})}
                    disabled={zoom <= 0.5}>
              <ZoomOut size={14}/>
            </button>
          </div>

          <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Zoom In">
            <button className={cn(outerButtonStyle)} onClick={() => zoomTo(zoom + 0.1, {duration: 200})}
                    disabled={zoom >= 1.5}>
              <ZoomIn size={14}/>
            </button>
          </div>

        </div>

        <div className="grid grid-cols-2 bg-white rounded-full ring-1 ring-neutral-200 shadow-md p-1">

          <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Pan Up">
            <button className={cn(outerButtonStyle)} onClick={() => pan(0, PAN_AMOUNT)}>
              <ArrowUp size={14}/>
            </button>
          </div>

          <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Pan Down">
            <button className={cn(outerButtonStyle)} onClick={() => pan(0, -1 * PAN_AMOUNT)}>
              <ArrowDown size={14}/>
            </button>
          </div>

        </div>

        <div className="grid grid-cols-2 bg-white rounded-full ring-1 ring-neutral-200 shadow-md p-1">

          <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Pan Left">
            <button className={cn(outerButtonStyle)} onClick={() => pan(PAN_AMOUNT, 0)}>
              <ArrowLeft size={14}/>
            </button>
          </div>

          <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Pan Right">
            <button className={cn(outerButtonStyle)} onClick={() => pan(-1 * PAN_AMOUNT, 0)}>
              <ArrowRight size={14}/>
            </button>
          </div>

        </div>

        <div className="grid grid-cols-1 bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
          <div className="relative flex items-center" style={{zIndex: 21}}>

            {isOpen ? (
              <div>
                <div className="absolute bottom-full pb-2 flex flex-col gap-2">

                  <div className="bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
                    <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Chat">
                      <button onClick={() => onCreateNode("promptNode")} className={cn(outerButtonStyle, "btn-lg")}>
                        <MessagesSquare size={16} color={nodeColors.promptNode}/>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
                    <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Note">
                      <button onClick={() => onCreateNode("textNode")} className={cn(outerButtonStyle, "btn-lg")}>
                        <LucideTextCursorInput size={16} color={nodeColors.textNode}/>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
                    <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Summary">
                      <button onClick={() => onCreateNode("summaryNode")} className={cn(outerButtonStyle, "btn-lg")}>
                        <Minimize2 className="rotate-45" size={16} color={nodeColors.summaryNode}/>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
                    <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Merge">
                      <button onClick={() => onCreateNode("mergeNode")} className={cn(outerButtonStyle, "btn-lg")}>
                        <MergeIcon className="rotate-90" size={16} color={nodeColors.mergeNode}/>
                      </button>
                    </div>
                  </div>

                </div>

                <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Close">
                  <button onClick={() => setIsOpen(false)} className={cn(outerButtonStyle, "btn-lg")}>
                    <X size={14}/>
                  </button>
                </div>

              </div>

            ) : (

              <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Add Node">
                <button onClick={() => setIsOpen(true)} className={cn(outerButtonStyle, "btn-lg")}>
                  <Plus size={14}/>
                </button>
              </div>
            )}

          </div>
        </div>
      </Panel>
    </div>
  )
}
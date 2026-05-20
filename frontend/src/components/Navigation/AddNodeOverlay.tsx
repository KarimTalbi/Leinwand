import {Panel, useReactFlow} from "@xyflow/react";
import {NodeTypeNames} from "@/types.ts";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {useState} from "react";
import {cn} from "@/lib/utils.ts";
import {LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, Plus, X} from "lucide-react";
import {tooltipStyle, nodeColors} from "@/lib/styles.ts";
import {innerButtonStyle, outerButtonStyle} from "@/lib/styles.ts";

const AddNodeOverlay = () => {
  const {addNode} = useStore(useShallow((s) => ({addNode: s.addNode,})));
  const {screenToFlowPosition} = useReactFlow();
  const [isOpen, setIsOpen] = useState(false);


  const onCreateNode = async (type: NodeTypeNames) => {

    const position = screenToFlowPosition(
      {x: window.innerWidth / 2, y: window.innerHeight / 2}
    );
    addNode(type, position);
    setIsOpen(false);
  }


  return (
    <Panel position="bottom-right">

      {/* Overlay for closing the panel when clicking outside it */}
      {isOpen && (
        <div style={{position: 'fixed', inset: 0, zIndex: 10}} onMouseDown={() => setIsOpen(false)}/>
      )}

      {/* Open Button Menu */}
      <div className="relative flex items-center" style={{zIndex: 20}}>

        {/* Node Buttons */}
        {isOpen ? (
          <div>
            <div className="absolute bottom-full pb-1 flex flex-col gap-1">

              <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Chat">
                <button onClick={() => onCreateNode("promptNode")} className={innerButtonStyle}>
                  <MessagesSquare color={nodeColors.promptNode}/>
                </button>
              </div>

              <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Note">
                <button onClick={() => onCreateNode("textNode")} className={innerButtonStyle}>
                  <LucideTextCursorInput color={nodeColors.textNode}/>
                </button>
              </div>

              <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Summary">
                <button onClick={() => onCreateNode("summaryNode")} className={innerButtonStyle}>
                  <Minimize2 className="rotate-45" color={nodeColors.summaryNode}/>
                </button>
              </div>

              <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Merge">
                <button onClick={() => onCreateNode("mergeNode")} className={innerButtonStyle}>
                  <MergeIcon className="rotate-90" color={nodeColors.mergeNode}/>
                </button>
              </div>

            </div>

            {/* Close Button */}
            <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Close">
              <button onClick={() => setIsOpen(false)} className={outerButtonStyle}>
                <X/>
              </button>
            </div>

          </div>

        ) : (

          // Open Button

          <div className={cn(tooltipStyle, "tooltip-left [&::before]:text-md")} data-tip="Add Node">
            <button onClick={() => setIsOpen(true)} className={outerButtonStyle}>
              <Plus/>
            </button>
          </div>
        )}

      </div>
    </Panel>
  )
};

export default AddNodeOverlay;
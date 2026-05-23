import {cn} from "@/lib/utils.ts";
import {LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, Plus, X} from "lucide-react";
import {NodeTypeNames} from "@/types.ts";
import {useState} from "react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {nodeColors, outerButtonStyle, tooltipStyle} from "@/lib/styles.ts";


const AddConnectedNode = ({sourceId}: { sourceId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {createConnectedNode} = useStore(useShallow((state) => ({createConnectedNode: state.createConnectedNode,})));


  const onCreateNode = async (type: NodeTypeNames) => {
    createConnectedNode(type, sourceId);
    setIsOpen(false);
  };

  return (
    <div className="translate-x-65">
      <div className="grid grid-cols-1 w-6 bg-white rounded-full ring-1 ring-neutral-200 shadow-none translate-y-0">
        <div className="relative flex items-center" style={{zIndex: -10}}>

          {isOpen ? (
            <div>
              <div className="absolute top-full pt-2 flex flex-col gap-2">

                <div className="bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
                  <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Chat">
                    <button onClick={() => onCreateNode("promptNode")} className={cn(outerButtonStyle, "btn-xs")}>
                      <MessagesSquare size={14} color={nodeColors.promptNode}/>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
                  <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Note">
                    <button onClick={() => onCreateNode("textNode")} className={cn(outerButtonStyle, "btn-xs")}>
                      <LucideTextCursorInput size={14} color={nodeColors.textNode}/>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
                  <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Summary">
                    <button onClick={() => onCreateNode("summaryNode")} className={cn(outerButtonStyle, "btn-xs")}>
                      <Minimize2 className="rotate-45" size={14} color={nodeColors.summaryNode}/>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-full ring-1 ring-neutral-200 shadow-md">
                  <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Merge">
                    <button onClick={() => onCreateNode("mergeNode")} className={cn(outerButtonStyle, "btn-xs")}>
                      <MergeIcon className="rotate-90" size={14} color={nodeColors.mergeNode}/>
                    </button>
                  </div>
                </div>

              </div>

              <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Close">
                <button
                  onClick={() => setIsOpen(false)}
                  className={cn(outerButtonStyle, "btn-xs bg-neutral-300 shadow-none ring-1 ring-neutral-300 hover:scale-100 rounded-t-none")}
                >
                  <X size={14}/>
                </button>
              </div>

            </div>

          ) : (

            <div className={cn(tooltipStyle, "tooltip-right")} data-tip="Add Node">
              <button
                onClick={() => setIsOpen(true)}
                className={cn(outerButtonStyle, "btn-xs bg-neutral-300 shadow-none ring-1 ring-neutral-300 hover:scale-100 rounded-t-none")}
              >
                <Plus size={14}/>
              </button>
            </div>

          )}

        </div>
      </div>
    </div>
  )
};

export default AddConnectedNode;
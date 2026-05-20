import {Panel, useReactFlow} from "@xyflow/react";
import {NodeTypeNames} from "@/types.ts";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {useState} from "react";
import {cn} from "@/lib/utils.ts";
import {LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, Plus, X} from "lucide-react";


const NodeButtons = [
  {name: "Chat", icon: <MessagesSquare/>, color: "#ec4899", type: "promptNode"},
  {name: "Note", icon: <LucideTextCursorInput/>, color: "#309898", type: "textNode"},
  {name: "Summary", icon: <Minimize2 className="rotate-45"/>, color: "#bf4546", type: "summaryNode"},
  {name: "Merge", icon: <MergeIcon className="rotate-90"/>, color: "#f5c45e", type: "mergeNode"},
]


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
        <div
          style={{position: 'fixed', inset: 0, zIndex: 10}}
          onMouseDown={() => setIsOpen(false)}
        />
      )}

      {/* Open Button Menu */}

      <div className="relative flex items-center" style={{zIndex: 20}}>

        {/* Node Buttons */}

        {isOpen ? (
          <div>
            <div
              className={cn(
                "absolute bottom-full pb-1 flex flex-col gap-1",
              )}>

              {NodeButtons.map((button) => (

                <button className="tooltip tooltip-left" data-tip={button.name}>
                  <div
                    onClick={() => onCreateNode(button.type as NodeTypeNames)}
                    className={cn(
                      "btn btn-circle btn-lg",
                      "shadow-none border-none text-white",
                      "bg-[" + button.color + "]",
                    )}
                  >
                    {button.icon}
                  </div>
                </button>

              ))}

            </div>

            {/* Close Button */}

            <div className="tooltip tooltip-left" data-tip="Close">
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  "btn btn-circle btn-lg",
                  "shadow-none border-none text-white",
                  "bg-black",
                )}>
                <X/>
              </button>

            </div>
          </div>

        ) : (

          // Open Button

          <div className="tooltip tooltip-left" data-tip="Add Node">
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                "btn btn-circle btn-lg",
                "shadow-none border-none text-white",
                "bg-black",
              )}>
              <Plus/>
            </button>

          </div>
        )}


      </div>
    </Panel>
  )
};

export default AddNodeOverlay;
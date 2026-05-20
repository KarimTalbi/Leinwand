import {cn} from "@/lib/utils.ts";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, Plus, X} from "lucide-react";
import {NodeTypeNames} from "@/types.ts";
import {useState} from "react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {tooltipStyle} from "@/lib/styles.ts";


const AddConnectedNode = ({sourceId}: { sourceId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {createConnectedNode} = useStore(useShallow((state) => ({createConnectedNode: state.createConnectedNode,})));


  const onCreateNode = async (type: NodeTypeNames) => {
    createConnectedNode(type, sourceId);
  };

  return (

    <div style={{position: 'absolute'}} className="bg-[darkgray] translate-x-60 h-23px rounded-b-full"
    >
      <div className="relative flex items-center translate-y-1">

        {isOpen && (
          <div className="absolute top-full flex flex-col items-center gap-1">

            <div className={cn(tooltipStyle, "tooltip-left")} data-tip="Prompt Node">
              <CustomButton onClick={() => onCreateNode("promptNode").then(() => setIsOpen(false))} buttonStyle="circle"
                            color="neutral" size="xs" className="bg-[#ec4899]">
                <MessagesSquare size={14}/>
              </CustomButton>
            </div>

            <ToolTip position="left" label="Text Node">
              <CustomButton onClick={() => onCreateNode("textNode").then(() => setIsOpen(false))} buttonStyle="circle"
                            color="neutral" size="xs" className="bg-[#309898]">
                <LucideTextCursorInput size={14}/>
              </CustomButton>
            </ToolTip>

            <ToolTip position="left" label="Summary Node">
              <CustomButton onClick={() => onCreateNode("summaryNode").then(() => setIsOpen(false))}
                            buttonStyle="circle"
                            color="neutral" size="xs" className="bg-[#bf4546]">
                <Minimize2 className="rotate-45" size={14}/>
              </CustomButton>
            </ToolTip>

            <ToolTip position="left" label="Merge Node">
              <CustomButton onClick={() => onCreateNode("mergeNode").then(() => setIsOpen(false))} buttonStyle="circle"
                            color="neutral" size="xs" className="bg-[#f5c45e]">
                <MergeIcon className="rotate-90" size={14}/>
              </CustomButton>
            </ToolTip>

          </div>
        )}

        <CustomButton onClick={() => setIsOpen(!isOpen)} buttonStyle="circle" color="neutral"
                      size="xs" className="bg-[#a9a9a9] shadow-none">
          {isOpen ? <X size={14}/> : <Plus size={14}/>}
        </CustomButton>

      </div>

    </div>

  )
};

export default AddConnectedNode;
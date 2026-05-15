import {useNodeConnections} from "@xyflow/react";
import {cn} from "@/lib/utils.ts";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, Plus, X} from "lucide-react";
import {AppState, NodeTypeNames} from "@/types.ts";
import {useState} from "react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";



interface AddConnectedNodeProps {
  sourceId: string;
  posX: number;
  posY: number;
}

const selector = (state: AppState) => ({
  createConnectedNode: state.createConnectedNode,
});

const AddConnectedNode = ({sourceId, posX, posY}: AddConnectedNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {createConnectedNode} = useStore(useShallow(selector));

  const connections = useNodeConnections({
    id: sourceId,
    handleType: "source",
  });

  const onCreateNode = async (type: NodeTypeNames) => {
    const position = {x: posX + 450, y: posY};
    createConnectedNode(type, sourceId, position);
  };

  return (
    <div>
      {connections.length === 0 && (

      <div
        style={{position: 'absolute'}}
        className="bg-[#a9a9a9] w-7 rounded-r-full h-6 translate-y-35"
      >
        <div
          className={cn(
            "relative flex items-center translate-x-1",
          )}>

          {isOpen && (
            <div
              className={cn(
                "absolute left-full pl-1",
                "flex items-center gap-1",
              )}>

              <ToolTip position="top" label="Prompt Node">
                <CustomButton onClick={() => onCreateNode("promptNode")} buttonStyle="circle" color="neutral" size="xs">
                  <MessagesSquare size={14}/>
                </CustomButton>
              </ToolTip>

              <ToolTip position="top" label="Text Node">
                <CustomButton onClick={() => onCreateNode("textNode")} buttonStyle="circle" color="neutral" size="xs">
                  <LucideTextCursorInput size={14}/>
                </CustomButton>
              </ToolTip>

              <ToolTip position="top" label="Summary Node">
                <CustomButton onClick={() => onCreateNode("summaryNode")} buttonStyle="circle" color="neutral" size="xs">
                  <Minimize2 className="rotate-45" size={14}/>
                </CustomButton>
              </ToolTip>

              <ToolTip position="top" label="Merge Node">
                <CustomButton onClick={() => onCreateNode("mergeNode")} buttonStyle="circle" color="neutral" size="xs">
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
      )}
    </div>
  )
};

export default AddConnectedNode;
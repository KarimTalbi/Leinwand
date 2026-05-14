import {Panel, useReactFlow} from "@xyflow/react";
import {AppState, NodeTypeNames} from "@/types.ts";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {useState} from "react";
import {cn} from "@/lib/utils.ts";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, Plus, X} from "lucide-react";


const selector = (state: AppState) => ({
  addNode: state.addNode,
});

const NavigationOverlay = () => {
  const {addNode} = useStore(useShallow(selector));
  const [isOpen, setIsOpen] = useState(false);
  const {screenToFlowPosition} = useReactFlow();

  const onCreateNode = async (type: NodeTypeNames) => {

    const position = screenToFlowPosition(
      {x: window.innerWidth / 2, y: window.innerHeight / 2}
    );
    addNode(type, position);
    setIsOpen(false);
  }


  return (
      <Panel position="bottom-right">
        <div
          className={cn(
            "relative flex items-center",
          )}>

          {isOpen && (
            <div
              className={cn(
                "absolute bottom-full pb-1 flex flex-col gap-1",
              )}>

              <ToolTip position="left" label="Prompt Node">
                <CustomButton onClick={() => onCreateNode("promptNode")} buttonStyle="circle" color="neutral" size="xl">
                  <MessagesSquare />
                </CustomButton>
              </ToolTip>

              <ToolTip position="left" label="Text Node">
                <CustomButton onClick={() => onCreateNode("textNode")} buttonStyle="circle" color="neutral" size="xl">
                  <LucideTextCursorInput />
                </CustomButton>
              </ToolTip>

              <ToolTip position="left" label="Summary Node">
                <CustomButton onClick={() => onCreateNode("summaryNode")} buttonStyle="circle" color="neutral" size="xl">
                  <Minimize2 className="rotate-45"/>
                </CustomButton>
              </ToolTip>

              <ToolTip position="left" label="Merge Node">
                <CustomButton onClick={() => onCreateNode("mergeNode")} buttonStyle="circle" color="neutral" size="xl">
                  <MergeIcon className="rotate-90"/>
                </CustomButton>
              </ToolTip>

            </div>

          )}


          <CustomButton onClick={() => setIsOpen(!isOpen)} buttonStyle="circle" color={isOpen ? "error" : "secondary"}
                        size="xl">
            {isOpen ? <X /> : <Plus />}
          </CustomButton>

        </div>
      </Panel>
  )
};

export default NavigationOverlay;
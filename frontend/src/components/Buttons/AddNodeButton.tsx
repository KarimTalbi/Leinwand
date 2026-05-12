import {useState} from "react";
import CustomButton, {ButtonColor, ButtonStyle, ButtonSize} from "@/components/Buttons/CustomButton.tsx";
import {LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, Plus, X} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {AppState, NodeTypeNames} from "@/types.ts";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {useReactFlow} from "@xyflow/react";
import {position, ToolTip} from "@/components/Buttons/ToolTip.tsx"

export type Orientation = "horizontal" | "horizontalLeft" | "vertical" | "verticalTop";

const orientationStyles: Record<Orientation, string> = {
  horizontal: "flex-row",
  horizontalLeft: "flex-row-reverse",
  vertical: "flex-col",
  verticalTop: "flex-col-reverse",
};

interface AddNodeButtonProps {
  sourceId?: string;
  posX?: number;
  posY?: number;
  size?: ButtonSize,
  color?: ButtonColor,
  style?: ButtonStyle,
  orientation?: Orientation,
  toolTipPosition?: position,
}

const selector = (state: AppState) => ({
  addNode: state.addNode,
  createConnectedNode: state.createConnectedNode,
});

export const AddNodeButton = ({
                                sourceId,
                                posX,
                                posY,
                                size,
                                color,
                                style,
                                orientation = "vertical"
                              }: AddNodeButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {screenToFlowPosition} = useReactFlow()
  const {addNode, createConnectedNode} = useStore(useShallow(selector));

  const onCreateNode = async (type: NodeTypeNames) => {

    if (!sourceId) {

      const position = screenToFlowPosition(
        {x: window.innerWidth / 2, y: window.innerHeight / 2}
      );
      addNode(type, position);

    } else if (sourceId && posX && posY) {

      const position = {x: posX + 800, y: posY};
      createConnectedNode(type, sourceId, position);

    } else {
      console.error("Invalid sourceId or position");
    }
  };


  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1",
        orientationStyles[orientation]
      )}>


      <div
        className={cn(
          isOpen ? "scale-y-100" : "scale-y-0 h-0",
          isOpen ? "transition-scale duration-200 origin-bottom" : "",
          "flex items-center justify-center gap-1",
          orientationStyles[orientation]
        )}>

        <ToolTip position="left" label="Prompt Node">
          <CustomButton onClick={() => onCreateNode("promptNode")} buttonStyle="circle" color="neutral" size="xl">
            <MessagesSquare/>
          </CustomButton>
        </ToolTip>

        <ToolTip position="left" label="Text Node">
          <CustomButton onClick={() => onCreateNode("textNode")} buttonStyle="circle" color="neutral" size="xl">
            <LucideTextCursorInput/>
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

      <ToolTip position="left" label={isOpen ? "Close" : "Add Node"}>
        <CustomButton onClick={() => setIsOpen(!isOpen)} buttonStyle={style} color={isOpen ? "error" : color}
                      size={size}>
          {isOpen ? <X/> : <Plus/>}
        </CustomButton>
      </ToolTip>
    </div>
  )
}
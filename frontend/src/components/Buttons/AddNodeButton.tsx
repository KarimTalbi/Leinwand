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
  toolTipPosition: position,
}

const selector = (state: AppState) => ({
  addNode: state.addNode,
  createConnectedNode: state.createConnectedNode,
});

export const AddNodeButton = (
  {
    sourceId,
    posX,
    posY,
    size,
    color,
    style,
    orientation = "vertical",
    toolTipPosition = "left",
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
        orientationStyles[orientation],
      )}>

      {isOpen && (
      <div
        className={cn(
          isOpen ? "scale-y-100" : "scale-y-0 h-0",
          isOpen ? "transition-scale duration-200 origin-bottom" : "",
          "flex items-center justify-center gap-1",
          orientationStyles[orientation]
        )}>

        <ToolTip position={toolTipPosition as position} label="Prompt Node">
          <CustomButton onClick={() => onCreateNode("promptNode")} buttonStyle={style} color="neutral" size={size}>
            <MessagesSquare size={size === "xs" ? 14 : 25}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position={toolTipPosition as position} label="Text Node">
          <CustomButton onClick={() => onCreateNode("textNode")} buttonStyle={style} color="neutral" size={size}>
            <LucideTextCursorInput size={size === "xs" ? 14 : 25}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position={toolTipPosition as position} label="Summary Node">
          <CustomButton onClick={() => onCreateNode("summaryNode")} buttonStyle={style} color="neutral" size={size}>
            <Minimize2 className="rotate-45" size={size === "xs" ? 14 : 25}/>
          </CustomButton>
        </ToolTip>

        <ToolTip position={toolTipPosition as position} label="Merge Node">
          <CustomButton onClick={() => onCreateNode("mergeNode")} buttonStyle={style} color="neutral" size={size}>
            <MergeIcon className="rotate-90" size={size === "xs" ? 14 : 25}/>
          </CustomButton>
        </ToolTip>

      </div>
      )}


        <CustomButton onClick={() => setIsOpen(!isOpen)} buttonStyle={style} color={isOpen ? "error" : color}
                      size={size}>
          {isOpen ? <X size={size === "xs" ? 14 : 25}/> : <Plus size={size === "xs" ? 14 : 25}/>}
        </CustomButton>

    </div>
  )
}
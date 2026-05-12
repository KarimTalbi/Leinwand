import {Plus, LucideTextCursorInput, MessagesSquare, MergeIcon, Minimize2} from "lucide-react";
import {AppState, NodeTypeNames} from "@/types.ts";
import {useReactFlow} from "@xyflow/react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {cn} from "@/lib/utils.ts";
import React from "react";

const selector = (state: AppState) => ({
  addNode: state.addNode,
  createConnectedNode: state.createConnectedNode,
});

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type ButtonColor = "primary" | "secondary" | "accent" | "ghost" | "link" | "default";

const sizeStyles: Record<ButtonSize, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

const colorStyles: Record<ButtonColor, string> = {
  default: "btn-default",
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  ghost: "btn-ghost",
  link: "btn-link",
};

const nodeButtons: { tip: string; type: NodeTypeNames; icon: React.ReactNode }[] = [
  {tip: "Merge Node", type: "mergeNode", icon: <MergeIcon className="rotate-90"/>},
  {tip: "Summary Node", type: "summaryNode", icon: <Minimize2 className="rotate-45"/>},
  {tip: "Text Node", type: "textNode", icon: <LucideTextCursorInput/>},
  {tip: "Prompt Node", type: "promptNode", icon: <MessagesSquare/>},
];

interface AddNodeMenuProps {
  sourceId?: string;
  posX?: number;
  posY?: number;
  size?: ButtonSize;
  color?: ButtonColor;
  className?: string;
}

const AddNodeMenu = ({sourceId, posX, posY, size = "lg", color = "secondary", className}: AddNodeMenuProps) => {
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
        "fab [&]:flex-col",
        className
      )}
    >
      <div className={cn(
        "tooltip tooltip-right", size === "xl" ? "[&::before]:text-2xl" : ""
      )}
           data-tip="Add Node"
      >

        <div
          tabIndex={0}
          role="button"
          className={cn("btn btn-circle border", sizeStyles[size], colorStyles[color])}
        >
          <Plus/>
        </div>
      </div>

      <div className="fab-close">
        <span className={cn("btn btn-circle btn-error border", sizeStyles[size])}>✕</span>
      </div>

      {nodeButtons.map(({tip, type, icon}) => (
        <div
          key={type}
          className={cn(
            "tooltip tooltip-right", size === "xl" ? "[&::before]:text-2xl" : ""
          )}
          data-tip={tip}
        >
          <button
            className={cn("btn btn-circle", sizeStyles[size])}
            onClick={() => onCreateNode(type)}
          >
            {icon}
          </button>
        </div>
      ))}
    </div>
  );
}

export default AddNodeMenu;
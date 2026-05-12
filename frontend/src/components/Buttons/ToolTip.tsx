import React from "react";
import {cn} from "@/lib/utils.ts";

export type position = "top" | "bottom" | "left" | "right";


interface ToolTipProps {
  children: React.ReactNode;
  position: position;
  label: string;
}

const toolTipPositions: Record<position, string> = {
  top: "tooltip-top",
  bottom: "tooltip-bottom",
  left: "tooltip-left",
  right: "tooltip-right",
};

export const ToolTip = ({children, position, label}: ToolTipProps) => {
  return (
    <div
      className={cn("tooltip", toolTipPositions[position])} data-tip={label}>
      {children}
    </div>
  )
};
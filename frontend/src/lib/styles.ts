import {LucideIcon, LucideMerge, LucideMessageSquare, LucideMinimize2, LucideNotebook} from "lucide-react";
import {NodeTypeNames} from "@/types.ts";
import {BackgroundVariant} from "@xyflow/react";
import React from "react";


// ——— Node Styles —————————————————————————————————————————————————————————————————————————————————————————————————— //


interface nodeTypeProps {
  label: string,
  color: string,
  icon: LucideIcon
  iconStyle?: string
}

export const nodeTypeProperties: Record<NodeTypeNames, nodeTypeProps> = {
  promptNode:   {label: "Chat",     color: '#ec4899',   icon: LucideMessageSquare,   iconStyle: ""           },
  textNode:     {label: "Note",     color: '#309898',   icon: LucideNotebook,        iconStyle: ""           },
  mergeNode:    {label: "merge",    color: '#f5c45e',   icon: LucideMerge,           iconStyle: "rotate-90"  },
  summaryNode:  {label: "Summery",  color: '#bf4546',   icon: LucideMinimize2,       iconStyle: "rotate-135" },
}


// ——— Node Component Styles ———————————————————————————————————————————————————————————————————————————————————————— //

export const defaultButtonSize = 12

export const NodeBackgroundStyle = "flex flex-col bg-white ring-1 ring-neutral-300 w-130 rounded-lg px-1"
export const NodeForegroundStyle = "flex flex-col flex-1 min-h-0 p-2 rounded-lg"
export const textareaStyle = "textarea textarea-md nodrag w-auto resize-none bg-neutral-100 rounded-md outline-none"
export const pulsingText = "text-muted-foreground animate-pulse"


// ——— Button Styles ———————————————————————————————————————————————————————————————————————————————————————————————— //


export const outerButtonStyle = "btn btn-circle border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const navbarButtonStyle = "btn btn-xs border-none gap-1 shadow-none bg-transparent text-[10px] text-neutral-500 font-normal hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const controlBarButtonStyle = "btn btn-circle m-1 btn-xs border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const controlBarFieldStyle = "grid bg-white rounded-full ring-1 ring-neutral-200 shadow-md p-1"
export const miniMapButtonStyle = "font-normal text-[10px] btn btn-square btn-xs border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const nodeHeaderButtonStyle = "btn btn-circle btn-sm border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const nodeFooterButtonStyle = "btn btn-xs border-none gap-1 shadow-none bg-transparent text-[10px] text-neutral-500 font-normal hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";

export const tooltipStyle = [
  "tooltip",
  "[--tt-bg:#e5e5e5]",
  "[&::before]:bg-[--tt-bg]",
  "[&::after]:border-b-[--tt-bg]",
  "[&::before]:text-[11px]",
  "[&::before]:text-[#737373]",
  "[&::before]:delay-500",
  "[&::after]:delay-500",
].join(" ");


// ——— UI Styles ———————————————————————————————————————————————————————————————————————————————————————————————————— //

interface CustomBackgroundProps {
  id: string,
  bgColor: string,
  size: number,
  gap: [number, number],
  offset: number,
  variant?: BackgroundVariant,
  lineWidth?: number,
  color?: string,
  style?: React.CSSProperties,
}

export const CustomBackgrounds: Partial<CustomBackgroundProps>[] = [
  {id: "1", bgColor: "white", size: 4, gap: [60, 60], offset: 162, color: "#e5e5e5"},
  {id: "2", size: 6, gap: [300, 300], offset: 190, variant: BackgroundVariant.Lines, lineWidth: 12, color: "white"},
  {id: "3", size: 4, gap: [300,300], offset: 190, variant: BackgroundVariant.Lines, lineWidth: 1, color: "#e5e5e5", style: {strokeDasharray: "15, 10", strokeDashoffset: "20"}}
];
import {LucideIcon, LucideMerge, LucideMessageSquare, LucideMinimize2, LucideNotebook} from "lucide-react";
import {NodeTypeNames} from "@/types.ts";


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


export const NodeBackgroundStyle = "flex flex-col bg-white shadow-md ring-1 ring-neutral-200 w-130 rounded-xl px-1"
export const NodeForegroundStyle = "flex flex-col flex-1 min-h-0 p-2 rounded-lg"
export const textareaStyle = "textarea textarea-md nodrag w-auto resize-none bg-neutral-100 rounded-md outline-none"
export const pulsingText = "text-muted-foreground animate-pulse"


// ——— Button Styles ———————————————————————————————————————————————————————————————————————————————————————————————— //


export const outerButtonStyle = "btn btn-circle border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const navbarButtonStyle = "btn border-none shadow-none bg-transparent text-xs text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const controlBarButtonStyle = "btn btn-circle w-10 h-10 border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const controlBarFieldStyle = "grid bg-white h-12 rounded-full ring-1 ring-neutral-200 shadow-md p-1"
export const miniMapButtonStyle = "btn btn-square btn-xs border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-100 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";

export const tooltipStyle = [
  "tooltip",
  "[--tt-bg:#a1a1a1]",
  "[&::before]:bg-[--tt-bg]",
  "[&::after]:border-b-[--tt-bg]",
  "[&::before]:font-semibold",
  "[&::before]:text-xs",
  "[&::before]:text-white",
  "[&::before]:delay-500",
  "[&::after]:delay-500",
].join(" ");




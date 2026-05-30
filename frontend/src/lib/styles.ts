import {Merge, MessagesSquare, Minimize2, Notebook} from "lucide-react";
import {NodeTypeNames} from "@/types.ts";
import {cn} from "@/lib/utils.ts";


// ——— Node Styles ——————————————————————————————————————————————————————————————————————————————————————————————————


export const typeProps: Record<NodeTypeNames, any> = {
  promptNode: {label: "Chat", color: '#ec4899', icon: MessagesSquare},
  textNode: {label: "Note", color: '#309898', icon: Notebook},
  mergeNode: {label: "merge", color: '#f5c45e', icon: Merge},
  summaryNode: {label: "Summery", color: '#bf4546', icon: Minimize2},
}


// ——— Node Component Styles ————————————————————————————————————————————————————————————————————————————————————————


export const NodeBackgroundStyle = "flex flex-col bg-white ring-1 ring-neutral-300 w-130 rounded-lg px-1"
export const NodeForegroundStyle = "flex flex-col flex-1 min-h-0 p-2 rounded-lg"


// ——— Button Styles ————————————————————————————————————————————————————————————————————————————————————————————————


export const navbarButtonStyle = "btn btn-square btn-sm"
export const addConnectedButtonStyle = "btn btn-ghost btn-square btn-xs"
export const nodeFooterButtonStyle = "btn btn-ghost btn-sm font-normal"
export const controlButtonStyle = "btn btn-ghost btn-square btn-sm"


// ——— Text Styles ——————————————————————————————————————————————————————————————————————————————————————————————————


export const textareaStyle = cn(
  "nodrag nowheel textarea textarea-sm w-full",
  "border-none bg-neutral-50 resize-none  ring-1 ring-neutral-300",
  "focus:outline-none focus:ring-neutral-500"
)
export const pulsingText = "text-muted-foreground animate-pulse"


// ——— UI Styles ————————————————————————————————————————————————————————————————————————————————————————————————————


export const controlBarStyle = cn(
  "flex flex-row gap-1 items-center justify-center",
  "text-neutral-500 bg-neutral-50 ring-1 ring-neutral-200",
  " rounded-full px-3 py-1.5"
)

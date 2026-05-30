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


export const NodeBackgroundStyle = "flex flex-col bg-white ring-2 ring-neutral-100 w-145 rounded-3xl py-1 px-2 shadow-md"
export const NodeForegroundStyle = "flex flex-col flex-1 p-2 rounded-lg"


// ——— Button Styles ————————————————————————————————————————————————————————————————————————————————————————————————


export const navbarButtonStyle = "btn btn-circle border-none shadow-none bg-transparent"
export const addConnectedButtonStyle = "btn btn-circle btn-ghost btn-sm border-none bg-transparent"
export const nodeHeaderButtonStyle = "btn btn-circle btn-sm"
export const controlButtonStyle = "btn btn-ghost btn-circle"


// ——— Text Styles ——————————————————————————————————————————————————————————————————————————————————————————————————


export const textareaStyle = cn(
  "nodrag nowheel textarea w-full p-3",
  "border-none bg-transparent resize-none",
  "focus:outline-none focus:ring-0"
)
export const bubbleLeftStyle = "chat-bubble shadow-sm rounded-2xl rounded-bl-none"
export const bubbleRightStyle = "chat-bubble shadow-sm rounded-2xl rounded-br-none"


// ——— UI Styles ————————————————————————————————————————————————————————————————————————————————————————————————————


export const controlBarStyle = cn(
  "flex flex-row gap-1 items-center justify-center",
  "text-neutral-500 bg-white ring-2 ring-neutral-100",
  " rounded-full shadow-md p-0.5"
)

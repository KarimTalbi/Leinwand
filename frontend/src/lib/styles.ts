import {Merge, MessagesSquare, Minimize2, Notebook} from "lucide-react";
import {NodeTypeNames} from "@/types.ts";
import {cn} from "@/lib/utils.ts";


// ——— General Styles ———————————————————————————————————————————————————————————————————————————————————————————————


export const background = "bg-white dark:bg-neutral-800"
export const foreground = "bg-neutral-100 dark:bg-neutral-900"
export const ring = "ring-1 ring-neutral-200 dark:ring-neutral-700"
export const text = "text-neutral-600 dark:text-neutral-100"

export const bgColor = "bg-neutral-100 dark:bg-neutral-800"


// ——— Node Styles ——————————————————————————————————————————————————————————————————————————————————————————————————


export const typeProps: Record<NodeTypeNames, any> = {
  promptNode: {label: "Chat", color: '#ec4899', icon: MessagesSquare},
  textNode: {label: "Note", color: '#309898', icon: Notebook},
  mergeNode: {label: "merge", color: '#f5c45e', icon: Merge},
  summaryNode: {label: "Summery", color: '#bf4546', icon: Minimize2},
}


// ——— Node Component Styles ————————————————————————————————————————————————————————————————————————————————————————


export const NodeBackgroundStyle = cn("flex flex-col w-145 rounded-3xl py-1 px-2 shadow-md", background, ring, text)
export const NodeForegroundStyle = "flex flex-col flex-1 rounded-lg"


export const navbarStyle = cn("flex flex-row items-center gap-2 p-1 rounded-full shadow-sm", background, ring, text)

// ——— Button Styles ————————————————————————————————————————————————————————————————————————————————————————————————

export const flowButtonStyle = "btn btn-circle disabled:opacity-30 dark:bg-neutral-900"
export const navbarButtonStyle = flowButtonStyle
export const nodeHeaderButtonStyle = flowButtonStyle
export const controlButtonStyle = flowButtonStyle


// ——— Text Styles ——————————————————————————————————————————————————————————————————————————————————————————————————


export const textareaStyle = cn(
  "w-full p-3 resize-none focus:outline-none"
)
export const textAreaWrapper = cn(
  foreground, text, ring, "rounded-2xl mb-1 shadow-sm hover:ring-neutral-300 dark:hover:ring-neutral-600 nodrag nowheel text-sm"
)

const bubble = "chat-bubble shadow-sm rounded-2xl"
export const bubbleLeftStyle = cn(bubble, "rounded-bl-none", foreground)
export const bubbleRightStyle = cn(bubble, "rounded-br-none", foreground)


// ——— UI Styles ————————————————————————————————————————————————————————————————————————————————————————————————————


export const controlBarStyle = cn(
  "flex flex-row gap-1 items-center justify-center rounded-full shadow-md p-1", text, background, ring
)

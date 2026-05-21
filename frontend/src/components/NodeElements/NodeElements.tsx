import React from "react";

import {ChevronLeft, ChevronRight, LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, X} from "lucide-react";
import useStore from "@/store.ts";
import {cn} from "@/lib/utils.ts";
import {outerButtonStyle} from "@/lib/styles.ts";

interface BackgroundProps {
  children: React.ReactNode,
  className?: string
}

interface ForegroundProps {
  children: React.ReactNode,
  className?: string
}

interface HeaderProps {
  title: string,
  color: string,
  id: string,
  loading?: boolean
}

export const NodeBackground = ({children, className}: BackgroundProps) => (
  <div
    className={cn('flex flex-col',
      "bg-white border-neutral-300 border-none shadow-md ring-1 ring-neutral-200 w-130 rounded-xl p-2",
      className,
    )}
  >
    {children}
  </div>
)


export const NodeForeground = ({children}: ForegroundProps) => (
  <div className="flex flex-col flex-1 min-h-0 p-2 rounded-lg">
    {children}
  </div>
)


export const NodeHeader = ({title, color, id, loading}: HeaderProps) => {
  const {deleteNode, moveNode} = useStore();

  const icon = () => {
    if (title === "Chat") return <MessagesSquare size={14} color={color} strokeWidth={2.5}/>
    if (title === "Summary") return <Minimize2 className="rotate-45" size={14} color={color} strokeWidth={2.5}/>
    if (title === "Merge") return <MergeIcon className="rotate-90" size={14} color={color} strokeWidth={2.5}/>
    if (title === "Note") return <LucideTextCursorInput size={14} color={color} strokeWidth={2.5}/>
  }

  return (
    <div className="flex items-center justify-between shrink-0 pl-2">
      <div className="flex items-center gap-1.5">
        {icon()}
        <h1 className={cn(
          "flex items-center gap-1 text-sm font-bold",
        )}>{title}</h1>
      </div>

      <div className="flex items-center gap-1">

      <button className={cn(outerButtonStyle, "btn-sm border-none bg-transparent shadow-none")} onClick={() => moveNode(id, "left")} disabled={loading}>
        <ChevronLeft size={14} color={color}></ChevronLeft>
      </button>

      <button className={cn(outerButtonStyle, "btn-sm border-none bg-transparent shadow-none")} onClick={() => moveNode(id, "right")} disabled={loading}>
        <ChevronRight size={14} color={color}></ChevronRight>
      </button>

      <button className={cn(outerButtonStyle, "btn-sm border-none bg-transparent shadow-none")} onClick={() => deleteNode(id)} disabled={loading}>
        <X size={14} color={color}></X>
      </button>

      </div>
    </div>
  )
}


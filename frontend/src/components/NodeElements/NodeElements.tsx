import React from "react";

import {LucideTextCursorInput, MergeIcon, MessagesSquare, Minimize2, X} from "lucide-react";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import useStore from "@/store.ts";
import {cn} from "@/lib/utils.ts";

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

interface DeleteButtonProps {
  id: string,
  loading?: boolean
  className?: string
}

export const NodeBackground = ({children, className}: BackgroundProps) => (
  <div
    className={cn('flex flex-col',
      "bg-white/70 border-[lightgray] border-2 w-132 rounded-lg",
      "backdrop-blur-sm backdrop-saturate-150",
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
  const {deleteNode} = useStore();

  const icon = () => {
    if (title === "Chat") return <MessagesSquare size={14} color={color} strokeWidth={2.5}/>
    if (title === "Summary") return <Minimize2 className="rotate-45" size={14} color={color} strokeWidth={2.5}/>
    if (title === "Merge") return <MergeIcon className="rotate-90" size={14} color={color} strokeWidth={2.5}/>
    if (title === "Text") return <LucideTextCursorInput size={14} color={color} strokeWidth={2.5}/>
  }

  return(
    <div className="flex items-center justify-between px-2 py-0.5 shrink-0">
    <div className="flex items-center gap-1.5">
      {icon()}
      <h1 className={cn(
        "flex items-center gap-1 text-sm font-bold",
      )}>{title}</h1>
    </div>
    <button className="btn btn-circle btn-ghost btn-sm" onClick={() => deleteNode(id)} disabled={loading}>
      <X size={14} color={color}></X>
    </button>
  </div>
  )
}


export const DeleteButton = ({id, loading}: DeleteButtonProps) => {
  const {deleteNode} = useStore();

  return (
    <CustomButton
      onClick={() => deleteNode(id)}
      buttonStyle="circle"
      disabled={loading}
      size="xs"
      color="ghost"
      className="text-white hover:border-none hover:bg-transparent hover:shadow-none"
    >
      <X size={14}/>
    </CustomButton>
  )
}



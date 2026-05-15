import React from "react";

import {X} from "lucide-react";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import useStore from "@/store.ts";

interface BackgroundProps {
  style: React.CSSProperties,
  children: React.ReactNode
}

interface ForegroundProps {
  children: React.ReactNode
}

interface HeaderProps {
  title: string,
  children: React.ReactNode,
  icon: React.ReactNode
}

interface DeleteButtonProps {
  id: string,
  loading?: boolean
}

export const NodeBackground = ({style, children}: BackgroundProps) => (
  <div
    className={`w-100 h-90 flex flex-col rounded-xl border-2`}
    style={{...style, backgroundColor: `var(--node-color)`, borderColor: `var(--node-color)`}}
  >
    {children}
  </div>
)


export const NodeForeground = ({children}: ForegroundProps) => (
  <div className="flex flex-col flex-1 min-h-0 p-2 bg-white rounded-xl">
    {children}
  </div>
)


export const NodeHeader = ({title, children, icon}: HeaderProps) => (
  <div className="flex items-center justify-between px-2 py-0.5 shrink-0">
    <div className="flex items-center gap-1.5">
    {icon}
    <h1 className="flex items-center gap-1 text-sm text-white">{title}</h1>
    </div>

    <div className="flex items-center gap-1">
      {children}
    </div>
  </div>
)


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



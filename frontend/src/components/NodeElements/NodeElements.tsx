import React from "react";

import {X} from "lucide-react";
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
  children: React.ReactNode,
  icon: React.ReactNode,
  className?: string
}

interface DeleteButtonProps {
  id: string,
  loading?: boolean
  className?: string
}

export const NodeBackground = ({children, className}: BackgroundProps) => (
  <div
    className={cn('flex flex-col rounded-xl border-2', className)}
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



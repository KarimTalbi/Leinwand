import React from "react";

import {X} from "lucide-react";
import CircleIconButton from "@/components/menus/CircleButton.tsx";
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
  children: React.ReactNode
}

interface DeleteButtonProps {
  id: string,
  loading?: boolean
}

export const NodeBackground = ({style, children}: BackgroundProps) => (
  <div
    className='w-180 h-164.5 flex flex-col rounded-2xl shadow-xl'
    style={{...style, backgroundColor: `var(--node-color)`}}
  >
    {children}
  </div>
)


export const NodeForeground = ({children}: ForegroundProps) => (
  <div className="flex flex-col flex-1 min-h-0 p-3 bg-white rounded-2xl">
    {children}
  </div>
)


export const NodeHeader = ({title, children}: HeaderProps) => (
  <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
    <h1 className="text-xl font-bold text-white h-fit">{title}</h1>
    <div className="flex items-center gap-3">
      {children}
    </div>
  </div>
)


export const DeleteButton = ({id, loading}: DeleteButtonProps) => {
  const {deleteNode} = useStore();

  return (
    <CircleIconButton
      onClick={() => deleteNode(id)}
      title="Delete"
      tooltipPosition="top"
      bigTooltip={true}
      disabled={loading}
      className="bg-white text-black  border-[#e5e5e5] border"
    >
      <X/>
    </CircleIconButton>
  )
}



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
  children: React.ReactNode
}

interface DeleteButtonProps {
  id: string,
  loading?: boolean
}

export const NodeBackground = ({style, children}: BackgroundProps) => (
  <div
    className='w-100 h-90 flex flex-col rounded-xl'
    style={{...style, backgroundColor: `var(--node-color)`}}
  >
    {children}
  </div>
)


export const NodeForeground = ({children}: ForegroundProps) => (
  <div className="flex flex-col flex-1 min-h-0 p-2 bg-white rounded-lg m-1">
    {children}
  </div>
)


export const NodeHeader = ({title, children}: HeaderProps) => (
  <div className="flex items-center justify-between pl-3 pr-2 pt-1 shrink-0">
    <h1 className="text-sm font-bold text-white h-fit">{title}</h1>
    <div className="flex items-center gap-1.5">
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
      className="bg-white text-black  border-[#e5e5e5] border"
    >
      <X size={16}/>
    </CustomButton>
  )
}



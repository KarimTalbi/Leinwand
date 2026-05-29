import {ChevronLeft, ChevronRight, LucideIcon, X} from "lucide-react";
import React from "react";
import {useNodeMove} from "@/hooks/useNodeMove.ts";
import {useStoreWithId} from "@/hooks/useStoreWithId.ts";

interface HeaderProps {
  title: string,
  color: string,
  id: string,
  icon?: LucideIcon,
  children?: React.ReactNode
}

export const NodeHeader = ({title, color, id, icon, children}: HeaderProps) => {
  const {deleteNodeAction} = useStoreWithId(id);
  const {moveLeft, moveRight} = useNodeMove(id)

  const Icon = icon

  return (
    <div className="flex items-center justify-between shrink-0 pl-2 pt-1">
      <div className="flex items-center gap-1.5">

        {Icon && (
          <Icon size={14} color={color}/>
        )}

        <h1 className="flex items-center gap-1 text-sm font-semibold">{title}</h1>
      </div>

      {children}

      <div className="flex items-center">

        <div className="tooltip" data-tip="Move Left">
          <button className="btn btn-square btn-ghost btn-sm">
            <ChevronLeft size={14} color={color} onClick={moveLeft}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Move Right">
          <button className="btn btn-square btn-ghost btn-sm">
            <ChevronRight size={14} color={color} onClick={moveRight}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Delete">
          <button className="btn btn-square btn-ghost btn-sm">
            <X size={14} color={color} onClick={deleteNodeAction}/>
          </button>
        </div>

      </div>
    </div>
  )
}


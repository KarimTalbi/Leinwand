import React from 'react'
import {ChevronLeft, ChevronRight, LucideIcon, LucideProps, X} from 'lucide-react'
import {useNodeMove} from '@/hooks/useNodeMove'
import {useStoreWithId} from '@/hooks/useStoreWithId'
import {nodeHeaderButtonStyle} from "@/lib/styles.ts";
import {cn} from "@/lib/utils.ts";

interface HeaderProps {
  title: string
  color: string
  id: string
  icon?: LucideIcon
  children?: React.ReactNode
}

export const NodeHeader = ({title, color, id, icon, children}: HeaderProps) => {
  const {deleteNodeAction} = useStoreWithId(id)
  const {moveLeft, moveRight} = useNodeMove(id)

  const Icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>> | undefined = icon

  return (
    <div className="flex items-center justify-between shrink-0 pl-2 py-1">
      <div className="flex items-center gap-2">

        {Icon && (
          <Icon size={16} color={color}/>
        )}

        <h1 className="flex items-center gap-1 font-semibold tracking-wide">{title}</h1>
      </div>

      <div className="flex-1 items-center px-2 justify-start">
        {children}
      </div>

      <div className="flex items-center gap-1.5">

        <div className="tooltip" data-tip="Move Left">
          <button className={cn(nodeHeaderButtonStyle, "btn-sm")}>
            <ChevronLeft size={16} color={color} onClick={moveLeft}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Move Right">
          <button className={cn(nodeHeaderButtonStyle, "btn-sm")}>
            <ChevronRight size={16} color={color} onClick={moveRight}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Delete">
          <button className={cn(nodeHeaderButtonStyle, "btn-sm")}>
            <X size={16} color={color} onClick={deleteNodeAction}/>
          </button>
        </div>

      </div>
    </div>
  )
}

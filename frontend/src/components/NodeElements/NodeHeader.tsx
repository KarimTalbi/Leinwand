import {ChevronLeft, ChevronRight, X} from "lucide-react";
import useStore from "@/store.ts";
import {cn} from "@/lib/utils.ts";
import {outerButtonStyle} from "@/lib/styles.ts";
import React from "react";

interface HeaderProps {
  title: string,
  color: string,
  id: string,
  loading?: boolean
  children?: React.ReactNode
}

export const NodeHeader = ({title, color, id, loading, children}: HeaderProps) => {
  const {deleteNode, moveNode} = useStore();

  return (
    <div className="flex items-center justify-between shrink-0 pl-2">
      <div className="flex items-center gap-1.5">
        {children}
        <h1 className="flex items-center gap-1 text-sm font-bold">{title}</h1>
      </div>

      <div className="flex items-center gap-1">

        <button
          className={cn(outerButtonStyle, "btn-sm border-none bg-transparent shadow-none")}
          onClick={() => moveNode(id, "left")} disabled={loading}
        >
          <ChevronLeft size={14} color={color}/>
        </button>

        <button
          className={cn(outerButtonStyle, "btn-sm border-none bg-transparent shadow-none")}
          onClick={() => moveNode(id, "right")} disabled={loading}
        >
          <ChevronRight size={14} color={color}/>
        </button>

        <button className={cn(outerButtonStyle, "btn-sm border-none bg-transparent shadow-none")}
                onClick={() => deleteNode(id)} disabled={loading}
        >
          <X size={14} color={color}/>
        </button>

      </div>
    </div>
  )
}


import React from 'react';
import {X} from "lucide-react";

import useStore from "@/store.ts";
import AddNodeMenu from "@/components/menus/AddNodeMenu.tsx";
import CircleIconButton from "@/components/menus/CircleButton.tsx";


interface BaseNodeProps {
  id: string;
  title: string;
  loading?: boolean;
  style?: React.CSSProperties;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}


const BaseNode = ({id, title, loading, headerActions, children, style}: BaseNodeProps) => {
  const {deleteNode} = useStore();


  return (

    <div className='w-180 h-164.5 flex flex-col rounded-2xl shadow-xl'
         style={{...style, backgroundColor: `var(--node-color)`}}>

        <AddNodeMenu color="default" size="xl" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
        <h1 className="text-xl font-bold text-white h-fit">{title}</h1>
        <div className="flex items-center gap-3">

          {headerActions}

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


        </div>
      </div>


      {/* Content */}
      <div className="flex flex-col flex-1 min-h-0 p-3 bg-white rounded-2xl">
        {children}
      </div>

    </div>

  )
};

export default BaseNode;
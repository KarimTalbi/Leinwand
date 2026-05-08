import React from 'react';
import {X} from "lucide-react";

import useStore from "@/store.ts";
import {NodeHeaderButton} from "@/components/nodes/nodeelements.tsx";
import AddNodeMenu from "@/components/menus/AddNodeMenu.tsx";


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

  const icon = () => (
    <X className="size-8 text-white"/>
  )


  return (

    <div className={`w-180 h-164.5 flex flex-col rounded-3xl shadow-xl indicator`}
    style={{...style, backgroundColor: `var(--node-color)`}}>

      <div className="indicator-item indicator-bottom pt-5 pl-5">
        <AddNodeMenu color="default"/>
      </div>


      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <div className="text-lg font-bold text-white mb-2 h-fit">{title}</div>
        <div className="flex items-center gap-4">

          {headerActions}

          <NodeHeaderButton title="Delete" icon={icon} disabled={loading} onClick={() => deleteNode(id)} />




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
import React from 'react';
import {X} from "lucide-react";

import useStore from "@/store.ts";

import {Button} from "@/components/ui/button.tsx";


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

    <div className={`w-180 h-150 flex flex-col rounded-3xl shadow-xl`}
    style={{...style, backgroundColor: `var(--node-color)`}}>


      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
        <div className="text-base font-bold text-white h-fit">{title}</div>
        <div className="flex items-center gap-3">

          {headerActions}


          <Button
            onClick={() => deleteNode(id)}
            disabled={loading}
            className="transition-opacity w-8 h-8 duration-200 bg-transparent rounded-full hover:opacity-70 hover:bg-transparent disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed"
          >

            <X className="size-7 text-white"/>

          </Button>


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
import React from "react";
import {Handle, Position} from "@xyflow/react";

import AddNodeMenu from "@/components/menus/AddNodeMenu.tsx";


const ConnectionHandle = ({sourceId, posX, posY, style}: {
  sourceId: string,
  posX: number,
  posY: number,
  style?: React.CSSProperties
}) => {


  return (

    <Handle id="source-1" type="source" position={Position.Right}
            className="flex flex-col w-4! h-8! rounded-l-none! rounded-r-full! border-none! translate-x-1! z-[-1]!"
            style={{...style, backgroundColor: 'var(--node-color)'}}>

      <div className="">

        <AddNodeMenu sourceId={sourceId} posX={posX} posY={posY} color="primary" size="lg"/>

      </div>

    </Handle>
  )
}

export default ConnectionHandle;
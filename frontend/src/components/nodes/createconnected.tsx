import React from "react";
import {Handle, Position} from "@xyflow/react";

import AddNodeMenu from "@/components/nodes/addnode.tsx";


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

      <div className="flex flex-col items-center justify-center mt-60 bg-black/20 rounded-r-full h-12 w-12">

        <AddNodeMenu sourceId={sourceId} posX={posX} posY={posY}/>

      </div>

    </Handle>
  )
}

export default ConnectionHandle;
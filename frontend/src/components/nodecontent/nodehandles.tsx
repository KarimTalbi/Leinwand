import {Handle, Position} from "@xyflow/react";
import React from "react";


const DefaultHandles = ({style}: {style?: React.CSSProperties}) => {
  return (
    <div>
    <Handle id="target-1" type="target" position={Position.Left}
            className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! -translate-x-1! z-[-1]!"
            style={{...style, backgroundColor: 'var(--node-color)'}}/>
    <Handle id="source-1" type="source" position={Position.Right}
          className="w-3! h-6! rounded-l-none! rounded-r-full! border-none! translate-x-1! z-[-1]!"
          style={{...style, backgroundColor: 'var(--node-color)'}}/>
    </div>
  )
};

const MergeHandles = ({style}: {style?: React.CSSProperties}) => {
  return (
    <div>
      <Handle id="target-1" type="target" position={Position.Left}
              className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! translate-y-20! -translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
      <Handle id="target-2" type="target" position={Position.Left}
              className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! -translate-y-20! -translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
      <Handle id="source-1" type="source" position={Position.Right}
              className="w-3! h-6! rounded-l-none! rounded-r-full! border-none! translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
    </div>
  )
}

export {DefaultHandles, MergeHandles}
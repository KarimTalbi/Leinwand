import React from "react";
import {Handle, Position, useNodeConnections} from "@xyflow/react";
import {cn} from "@/lib/utils.ts";


type handleType = "target" | "source";
type handlePosition = "left" | "right"


interface ConnectionHandleProps {
  nodeId: string,
  handleId: string,
  handleType: handleType,
  position: handlePosition,
  offset?: number,
  style?: React.CSSProperties,
  className?: string
}


export const ConnectionHandles = (
  {nodeId, handleId, handleType, position, offset, style, className}: ConnectionHandleProps
) => {

  const connections = useNodeConnections({
    id: nodeId,
    handleType: handleType,
    handleId: handleId
  });

  const handleOffset = () => {
    if (!offset) return '';

    return offset > 0 ? `translate-y-${offset}!` : `-translate-y-${offset*-1}!`;
  }

  const handlePositionStyle = () => {
    if (position === "left") return "w-4! h-8! rounded-l-full! rounded-r-none! border-none! -translate-x-1! z-[-1]!";
    return "w-4! h-8! rounded-l-none! rounded-r-full! border-none! translate-x-1! z-[-1]!";
  }

  return (
      <Handle
        id={handleId}
        type={handleType}
        position={position === "left" ? Position.Left : Position.Right}
        isConnectable={connections.length === 0}
        className={cn(
          handlePositionStyle(),
          handleOffset(),
          className
        )}
        style={{...style, backgroundColor: 'var(--node-color)'}}
      />
  )
};
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
  className?: string,
  children?: React.ReactNode
}


export const ConnectionHandles = (
  {nodeId, handleId, handleType, position, offset, style, className, children}: ConnectionHandleProps
) => {

  const connections = useNodeConnections({
    id: nodeId,
    handleType: handleType,
    handleId: handleId
  });


  const handlePositionStyle = () => {
    if (position === "left") return "w-1.5! h-8! rounded-l-full! rounded-r-none! border-none! -translate-x-0.5! z-[-1]!";
    return "w-1.5! h-8! rounded-l-none! rounded-r-full! border-none! translate-x-0.5! z-[-1]!";
  }

  return (
      <Handle
        id={handleId}
        type={handleType}
        position={position === "left" ? Position.Left : Position.Right}
        isConnectable={connections.length === 0}
        className={cn(
          handlePositionStyle(),
          className
        )}
        style={{...style, backgroundColor: 'darkgray', transform: `translateY(${offset ?? 0}px)` + (position === "left" ? " translateX(-4px)" : " translateX(4px)")}}
      >
        {children}
      </Handle>
  )
};
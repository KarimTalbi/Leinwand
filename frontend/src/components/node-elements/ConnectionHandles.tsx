import React from 'react'
import {Handle, Position, useNodeConnections} from '@xyflow/react'
import {cn} from '@/lib/utils'

type HandleType = 'target' | 'source'
type HandlePosition = 'top' | 'bottom'

interface ConnectionHandleProps {
  nodeId: string,
  handleId: string,
  handleType: HandleType,
  position: HandlePosition,
  color?: string,
  offset?: number,
  style?: React.CSSProperties,
  className?: string,
  children?: React.ReactNode
}

export const ConnectionHandles = (
  {nodeId, handleId, handleType, position, color, offset, style, className, children}: ConnectionHandleProps,
) => {

  const connections = useNodeConnections({
    id: nodeId,
    handleType: handleType,
    handleId: handleId,
  })

  const handlePositionStyle = () => {
    if (position === 'top') return 'w-30! h-3! rounded-t-full! rounded-b-none! border-none! -translate-y-2! z-[-1]!'
    return 'w-30! h-3! rounded-t-none! rounded-b-full! border-none! translate-y-2! z-[-1]!'
  }

  return (
    <Handle
      id={handleId}
      type={handleType}
      position={position === 'top' ? Position.Top : Position.Bottom}
      isConnectable={handleType === 'source' ? true : connections.length === 0}
      className={cn(
        handlePositionStyle(),
        className,
      )}
      style={{
        ...style,
        backgroundColor: color || 'darkgray',
        transform: `translateX(calc(-54% + ${offset ?? 0}px)) ${position === 'top' ? 'translateY(-4px)' : 'translateY(4px)'}`,
      }}
    >
      {children}
    </Handle>
  )
}

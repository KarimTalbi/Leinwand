import React from 'react'
import {Handle, Position, useNodeConnections} from '@xyflow/react'
import {cn} from '@/lib/utils'

type HandleType = 'target' | 'source'
type HandlePosition = 'top' | 'bottom'

/**
 * Properties for the ConnectionHandles component.
 */
interface ConnectionHandleProps {
  /** The unique identifier of the node this handle belongs to. */
  nodeId: string,
  /** The unique identifier for this specific handle. */
  handleId: string,
  /** The type of the handle, determining if it's for input or output. */
  handleType: HandleType,
  /** The position of the handle on the node. */
  position: HandlePosition,
  /** The color of the handle. Defaults to 'darkgray'. */
  color?: string,
  /** The horizontal offset of the handle in pixels. */
  offset?: number,
  /** Custom CSS properties to apply to the handle. */
  style?: React.CSSProperties,
  /** Additional CSS classes to apply to the handle. */
  className?: string,
  /** Child elements to render inside the handle. */
  children?: React.ReactNode
}


/**
 * Renders a custom connection handle for a node.
 * This component abstracts the logic for handle positioning, styling, and connection limits.
 * Target handles are limited to a single connection.
 *
 * @param props - The properties for the connection handle.
 * @returns A custom Handle component for React Flow.
 */
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

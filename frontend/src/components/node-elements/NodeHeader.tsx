import React from 'react'
import {ChevronLeft, ChevronRight, LucideIcon, LucideProps, X} from 'lucide-react'
import {useNodeMove} from '@/hooks/useNodeMove'
import {useStoreWithId} from '@/hooks/useStoreWithId'

/**
 * Properties for the NodeHeader component.
 */
interface HeaderProps {
  /** The title to display in the header. */
  title: string
  /** The primary color used for icons in the header. */
  color: string
  /** The unique identifier of the node this header belongs to. */
  id: string
  /** Optional icon component from lucide-react to display next to the title. */
  icon?: LucideIcon
  /** Optional child elements to render in the middle section of the header. */
  children?: React.ReactNode
}


/**
 * Renders the header section of a node.
 * This component provides a title, an optional icon, and built-in controls for moving
 * the node left/right within its branch and deleting the node. It uses custom hooks
 * to interact with the global store based on the node's ID.
 *
 * @param props - Component properties.
 * @returns The header component for a canvas node.
 */
export const NodeHeader = ({title, color, id, icon, children}: HeaderProps) => {
  const {deleteNodeAction} = useStoreWithId(id)
  const {moveLeft, moveRight} = useNodeMove(id)

  const Icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>> | undefined = icon

  return (
    <div className="flex items-center justify-between shrink-0 pl-2 py-1">
      <div className="flex items-center gap-2">

        {Icon && (
          <Icon size={16} color={color}/>
        )}

        <h1 className="flex items-center gap-1 font-semibold tracking-wide text-neutral-600">{title}</h1>
      </div>

      <div className="flex-1 items-center px-2 justify-start">
        {children}
      </div>

      <div className="flex items-center gap-1.5">

        <div className="tooltip" data-tip="Move Left">
          <button className="btn btn-circle btn-sm">
            <ChevronLeft size={16} color={color} onClick={moveLeft}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Move Right">
          <button className="btn btn-circle btn-sm">
            <ChevronRight size={16} color={color} onClick={moveRight}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Delete">
          <button className="btn btn-circle btn-sm">
            <X size={16} color={color} onClick={deleteNodeAction}/>
          </button>
        </div>

      </div>
    </div>
  )
}

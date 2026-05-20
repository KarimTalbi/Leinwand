import { Panel, useReactFlow } from '@xyflow/react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const PAN_AMOUNT = 300

export const PanControls = () => {
  const { getViewport, setViewport } = useReactFlow()

  const pan = (dx: number, dy: number) => {
    const { x, y, zoom } = getViewport()
    void setViewport({ x: x + dx, y: y + dy, zoom })
  }

  return (
    <Panel position="bottom-center" className="-translate-x-123 -translate-y-1">
      <div className="grid grid-cols-3 gap-1 ">

        <div />

        <button className="btn btn-circle btn-neutral btn-xs" onClick={() => pan(0, PAN_AMOUNT)}>
          <ChevronUp size={14} />
        </button>

        <div />

        <button className="btn btn-circle btn-neutral btn-xs" onClick={() => pan(PAN_AMOUNT, 0 )}>
          <ChevronLeft size={14} />
        </button>

        <div />

        <button className="btn btn-circle btn-neutral btn-xs" onClick={() => pan(-1 * PAN_AMOUNT, 0 )}>
          <ChevronRight size={14} />
        </button>

        <div />

        <button className="btn btn-circle btn-neutral btn-xs" onClick={() => pan(0, -1 * PAN_AMOUNT )}>
          <ChevronDown size={14} />
        </button>

        <div />

      </div>
    </Panel>
  )
}
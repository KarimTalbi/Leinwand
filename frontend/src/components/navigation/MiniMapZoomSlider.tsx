import {MiniMap, Panel} from '@xyflow/react'
import {usePan} from '@/hooks/usePan'
import {AnyNodeType} from '@/types'


/**
 * Displays a minimap of nodes on the canvas, with a range slider for zooming in and out.
 * Positioned at the bottom-right of the screen. Includes a button to reset zoom.
 *
 * @param props - Component properties.
 * @param props.nodeColor - A function that determines the color of a node in the minimap based on its type or data.
 * @returns The minimap component with zoom controls.
 */
export function MiniMapZoomSlider({nodeColor}: { nodeColor: (node: AnyNodeType) => string }) {
  const {resetZoom, zoom, zoomTo, minZoom, maxZoom, zoomPercent} = usePan()

  return (
    <Panel position="bottom-right">

      <div
        className="bg-white w-50 h-40 rounded-2xl ring-2 ring-neutral-100 shadow-md">

        <MiniMap
          className="rounded-xl w-48 h-30 overflow-hidden absolute -left-2.5 -bottom-2.5! ring-1 ring-neutral-200"
          zoomable
          pannable
          bgColor="transparent"
          maskColor="rgb(161, 161, 161, 0.2)"
          nodeColor={nodeColor}
          nodeBorderRadius={50}
          offsetScale={0}
        />

        <div style={{position: 'absolute', bottom: 130, right: 9, zIndex: 1000}}>
          <div className="flex gap-2 flex-row items-center w-45">

            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.1}
              value={zoom}
              onChange={(e) => zoomTo(Number(e.target.value))}
              className="range range-xs text-neutral-600 [--range-fill:0] [--range-thumb:white]"
            />

            <button className="btn btn-xs" onClick={resetZoom}>
              {zoomPercent}%
            </button>

          </div>
        </div>

      </div>

    </Panel>
  )
}

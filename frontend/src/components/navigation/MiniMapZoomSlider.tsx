import {MiniMap, Panel} from '@xyflow/react'
import {usePan} from '@/hooks/usePan'
import {AnyNodeType} from '@/types'
import {cn} from "@/lib/utils.ts";
import {background, flowButtonStyle, ring, text} from "@/lib/styles.ts";

export function MiniMapZoomSlider({nodeColor}: { nodeColor: (node: AnyNodeType) => string }) {
  const {resetZoom, zoom, zoomTo, minZoom, maxZoom, zoomPercent} = usePan()

  return (
    <Panel position="bottom-right">

      <div
        className={cn("w-50 h-43 rounded-2xl shadow-md", ring, background)}>

        <MiniMap
          className={cn("rounded-xl w-48 h-30 overflow-hidden absolute -left-2.75 -bottom-2.75!", ring)}
          zoomable
          pannable
          bgColor="transparent"
          maskColor="rgb(161, 161, 161, 0.2)"
          nodeColor={nodeColor}
          nodeBorderRadius={50}
          offsetScale={0}
        />

        <div style={{position: 'absolute', bottom: 133, right: 9, zIndex: 1000}}>
          <div className="flex gap-2 flex-row items-center w-45">

            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.1}
              value={zoom}
              onChange={(e) => zoomTo(Number(e.target.value))}
              className={cn("range range-sm [--range-fill:0] [--range-thumb:white]", text)}
            />

            <button className={cn(flowButtonStyle, text, "text-[10px] tracking-tighter btn-sm font-light")}
                    onClick={resetZoom}>
              {zoomPercent}%
            </button>

          </div>
        </div>

      </div>

    </Panel>
  )
}

import {MiniMap, Panel} from "@xyflow/react";
import {usePan} from "@/hooks/usePan.ts";

export function MiniMapZoomSlider({nodeColor}:{nodeColor?: (node: any) => string}) {
  const {resetZoom, zoom, zoomTo, minZoom, maxZoom, zoomPercent} = usePan()


  return (
    <Panel position="bottom-right">

      <div className="bg-neutral-50 w-50 h-40 rounded-lg ring-1 ring-neutral-200 shadow-md">

        <MiniMap
          className="rounded-md w-48 h-30 overflow-hidden absolute -left-2.5 -bottom-2.5! ring-1 ring-neutral-200"
          zoomable
          pannable
          bgColor={"transparent"}
          maskColor={"rgb(161, 161, 161, 0.2)"}
          nodeColor={nodeColor}
          nodeBorderRadius={50}
          offsetScale={0}
        />

        <div style={{position: "absolute", bottom: 130, right: 7, zIndex: 1000}}>
          <div className="flex gap-2 flex-row items-center w-46.5">


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
  );
}

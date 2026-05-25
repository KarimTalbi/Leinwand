import {LucideMaximize} from "lucide-react";

import {MiniMap, Panel} from "@xyflow/react";

import {miniMapButtonStyle} from "@/lib/styles.ts";
import {CustomButton} from "@/components/ui/UiElements.tsx";
import {usePan} from "@/hooks/usePan.ts";
import {cn} from "@/lib/utils.ts";

export function MiniMapZoomSlider({nodeColor}:{nodeColor?: (node: any) => string}) {
  const {resetZoom, zoom, zoomTo, minZoom, maxZoom} = usePan()


  return (
    <Panel position="bottom-right">

      <div className="bg-white w-40 h-32 rounded-lg ring-1 ring-neutral-200 shadow-md">

        <MiniMap
          className="rounded-md w-37.5 h-25 overflow-hidden absolute -left-2.5 -bottom-2.5! ring-1 ring-neutral-200"
          zoomable
          pannable
          bgColor={"transparent"}
          maskColor={"rgb(161, 161, 161, 0.2)"}
          nodeColor={nodeColor}
          nodeBorderRadius={50}
          offsetScale={0}
        />

        <div style={{position: "absolute", bottom: 104, right: 5, zIndex: 1000}}>
          <div className="flex gap-1 flex-row items-center w-38.5">

            <CustomButton className={miniMapButtonStyle} icon={LucideMaximize} iconProps={{size:12}} onClick={resetZoom} tooltipLabel="Reset Zoom"/>

            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.1}
              value={zoom}
              onChange={(e) => zoomTo(Number(e.target.value))}
              className="range range-xs text-neutral-400 [--range-fill:0] w-full [--range-bg:#e5e5e5] [--range-thumb:white] mr-1"
            />

            <CustomButton className={cn(miniMapButtonStyle, "font-normal text-[10px]")} disabled={true} tooltipDisabled={true}>
              {(100 * zoom).toFixed(0)}%
            </CustomButton>

          </div>
        </div>

      </div>

    </Panel>
  );
}

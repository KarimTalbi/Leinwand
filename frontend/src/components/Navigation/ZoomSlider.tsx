import {Maximize} from "lucide-react";

import {useViewport, useStore, useReactFlow} from "@xyflow/react";

import {cn} from "@/lib/utils";
import {tooltipStyle, outerButtonStyle} from "@/lib/styles.ts";

export function ZoomSlider() {
  const {zoom} = useViewport();
  const {zoomTo} = useReactFlow();
  const minZoom = useStore((state) => state.minZoom);
  const maxZoom = useStore((state) => state.maxZoom);

  return (
    <div className="flex gap-2 flex-row items-center w-48">



      {/* Zoom Slider */}
      <input
        type="range"
        min={minZoom}
        max={maxZoom}
        step={0.1}
        value={zoom}
        onChange={(e) => zoomTo(Number(e.target.value))}
        className="range range-xs text-neutral-400 [--range-fill:0] w-full [--range-bg:#e5e5e5] [--range-thumb:white] mr-1"
      />


        <button className={cn(outerButtonStyle, "btn square btn-xs disabled:opacity-100")} onClick={() => zoomTo(1, {duration: 300})} disabled={true}>
          {(100 * zoom).toFixed(0)}%
        </button>

      <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Reset Zoom">
        <button className={cn(outerButtonStyle, "btn square btn-xs")} onClick={() => zoomTo(1, {duration: 300})}>
          <Maximize size={14}></Maximize>
        </button>
      </div>

    </div>
  );
}

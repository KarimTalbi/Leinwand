import {Maximize, Minus, Plus} from "lucide-react";

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

      {/* Zoom Out Button */}
      <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Zoom Out">
        <button className={cn(outerButtonStyle, "btn-xs")} onClick={() => zoomTo(zoom - 0.1, {duration: 300})}>
          <Minus size={14}/>
        </button>
      </div>

      {/* Zoom Slider */}
      <input
        type="range"
        min={minZoom}
        max={maxZoom}
        step={0.1}
        value={zoom}
        onChange={(e) => zoomTo(Number(e.target.value))}
        className="range text-stone-400 [--range-fill:0] w-[8vw] [--range-bg:#e7e5e4] [--range-thumb:white]"
      />


      {/* Zoom In Button */}
      <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Zoom In">
        <button className={cn(outerButtonStyle, "btn-xs")} onClick={() => zoomTo(zoom + 0.1, {duration: 300})}>
          <Plus size={14}/>
        </button>
      </div>

      {/* Reset Zoom Button */}
      <div className={cn(tooltipStyle, "tooltip-top")} data-tip="Reset Zoom">
        <button className={cn(outerButtonStyle, "font-normal btn-xs")} onClick={() => zoomTo(1, {duration: 300})}>
          <Maximize size={14}/>
        </button>
      </div>

    </div>
  );
}

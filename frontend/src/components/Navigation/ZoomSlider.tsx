"use client";

import {LockOpen, Maximize, Minus, Plus, Lock, Mouse} from "lucide-react";
import useStore from "@/store.ts"
import {useShallow} from "zustand/react/shallow";

import {
  useViewport,
  useStore as ZuseStore,
  useReactFlow,
  type PanelProps,
} from "@xyflow/react";

import {cn} from "@/lib/utils";
import {AppState} from "@/types.ts";
import CustomButton from "@/components/Buttons/CustomButton.tsx";
import {ToolTip} from "@/components/Buttons/ToolTip.tsx";

const selector = (state: AppState) => ({
  locked: state.locked,
  setLocked: state.setLocked,
  scrollToZoom: state.scrollToZoom,
  setScrollToZoom: state.setScrollToZoom,
});

export function ZoomSlider({
                             className,
                             orientation = "horizontal",
                             ...props
                           }: Omit<PanelProps, "children"> & {
  orientation?: "horizontal" | "vertical";
}) {
  const {zoom} = useViewport();
  const {zoomTo, zoomIn, zoomOut, fitView} = useReactFlow();
  const minZoom = ZuseStore((state) => state.minZoom);
  const maxZoom = ZuseStore((state) => state.maxZoom);

  const {locked, setLocked, scrollToZoom, setScrollToZoom} = useStore(useShallow(selector));

  return (
    <div
      className={cn(
        "text-foreground flex gap-1",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex gap-2",
          orientation === "horizontal" ? "flex-row" : "flex-col-reverse",
        )}
      >
        <ToolTip position="bottom" label={scrollToZoom ? "Disable Scroll Zoom" : "Enable Scroll Zoom"}>
          <CustomButton onClick={() => setScrollToZoom(!scrollToZoom)} buttonStyle="square">
            <Mouse className="size-4"></Mouse>
          </CustomButton>
        </ToolTip>

        <ToolTip label="Zoom Out" position="bottom">
          <CustomButton onClick={() => zoomOut({duration: 300})} buttonStyle="square">
            <Minus className="size-4"/>
          </CustomButton>
        </ToolTip>

        <div className="flex flex-col items-center justify-center">

          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={zoom}
            onChange={(e) => zoomTo(Number(e.target.value))}
            className=" range range-neutral range-xs w-[12vw]"
          />

        </div>

        <ToolTip label="Zoom In" position="bottom">
          <CustomButton onClick={() => zoomIn({duration: 300})} buttonStyle="square">
            <Plus className="size-4"/>
          </CustomButton>
        </ToolTip>

      </div>

      <ToolTip label="Reset Zoom" position="bottom">
      <CustomButton onClick={() => zoomTo(1, {duration: 300})} buttonStyle="square">
        {(100 * zoom).toFixed(0)}%
      </CustomButton>
      </ToolTip>

      <ToolTip label="Fit View" position="bottom">
      <CustomButton onClick={() => fitView({duration: 300})} buttonStyle="square">
        <Maximize className="size-4"/>
      </CustomButton>
      </ToolTip>

      <ToolTip label={locked ? "Unlock Canvas" : "Lock Canvas"} position="bottom">
      <CustomButton onClick={() => setLocked(!locked)} buttonStyle="square">
        {locked ? <LockOpen className="size-4"/> : <Lock className="size-4"/>}
      </CustomButton>
      </ToolTip>



    </div>
  );
}

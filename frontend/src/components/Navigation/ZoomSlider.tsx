"use client";

import {LockOpen, Maximize, Minus, Plus, Lock, Mouse, Expand, Shrink} from "lucide-react";
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
  const {zoomTo, zoomIn, zoomOut} = useReactFlow();
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
          "flex gap-2 items-center",
          orientation === "horizontal" ? "flex-row" : "flex-col-reverse",
        )}
      >
        <ToolTip position="bottom" label={scrollToZoom ? "Disable Scroll Zoom" : "Enable Scroll Zoom"}>
          <CustomButton onClick={() => setScrollToZoom(!scrollToZoom)} buttonStyle="square" size="sm">
            <Mouse className="size-4"></Mouse>
          </CustomButton>
        </ToolTip>


        <ToolTip label="Zoom Out" position="bottom">
          <CustomButton onClick={() => zoomOut({duration: 300})} buttonStyle="square" size="sm">
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
          <CustomButton onClick={() => zoomIn({duration: 300})} buttonStyle="square" size="sm">
            <Plus className="size-4"/>
          </CustomButton>
        </ToolTip>

      </div>


      <div className="flex-1 flex items-center justify-center">

        <CustomButton
          onClick={() => zoomTo(1, {duration: 300})}
          buttonStyle="square"
          disabled={true}
          className="text-black text-xs font-semibold mr-2"
          size="sm"
        >
          {(100 * zoom).toFixed(0)}%
        </CustomButton>

        <ToolTip label="Reset Zoom" position="bottom">
          <CustomButton onClick={() => zoomTo(1, {duration: 300})} buttonStyle="square" size="sm">
            <Maximize className="size-4"/>
          </CustomButton>
        </ToolTip>

        <ToolTip label="Max Zoom" position="bottom">
          <CustomButton onClick={() => zoomTo(maxZoom, {duration: 300})} buttonStyle="square" size="sm">
            <Shrink className="size-4"></Shrink>
          </CustomButton>
        </ToolTip>

        <ToolTip label="Min Zoom" position="bottom">
          <CustomButton onClick={() => zoomTo(minZoom, {duration: 300})} buttonStyle="square" size="sm">
            <Expand className="size-4"></Expand>
          </CustomButton>
        </ToolTip>

        <ToolTip label={locked ? "Unlock Canvas" : "Lock Canvas"} position="bottom">
          <CustomButton onClick={() => setLocked(!locked)} buttonStyle="square" size="sm" className="ml-2">
            {locked ? <LockOpen className="size-4"/> : <Lock className="size-4"/>}
          </CustomButton>
        </ToolTip>
      </div>


    </div>
  );
}

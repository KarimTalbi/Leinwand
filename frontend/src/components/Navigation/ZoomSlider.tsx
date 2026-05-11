"use client";

import {LockOpen, Maximize, Minus, Plus, Lock} from "lucide-react";
import useStore from "@/store.ts"
import {useShallow} from "zustand/react/shallow";

import {
  Panel,
  useViewport,
  useStore as ZuseStore,
  useReactFlow,
  type PanelProps,
} from "@xyflow/react";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {AppState} from "@/types.ts";

const selector = (state: AppState) => ({
  locked: state.locked,
  setLocked: state.setLocked,
});

export function ZoomSlider({
  className,
  orientation = "horizontal",
  ...props
}: Omit<PanelProps, "children"> & {
  orientation?: "horizontal" | "vertical";
}) {
  const { zoom } = useViewport();
  const { zoomTo, zoomIn, zoomOut, fitView } = useReactFlow();
  const minZoom = ZuseStore((state) => state.minZoom);
  const maxZoom = ZuseStore((state) => state.maxZoom);

  const {locked, setLocked} = useStore(useShallow(selector));

  return (
    <Panel
      className={cn(
        "bg-primary-foreground text-foreground flex gap-1 rounded-md p-1",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex gap-1",
          orientation === "horizontal" ? "flex-row" : "flex-col-reverse",
        )}
      >
        <Button
          aria-label="Zoom Out"
          variant="ghost"
          size="icon"
          onClick={() => zoomOut({ duration: 300 })}
          className="size-10"
        >
          <Minus className="size-5" />
        </Button>
        <Slider
          className={cn(
            orientation === "horizontal" ? "w-40" : "h-35",
          )}
          orientation={orientation}
          value={[zoom]}
          min={minZoom}
          max={maxZoom}
          step={0.01}
          onValueChange={(values) => zoomTo(values[0])}
        />
        <Button
          aria-label="Zoom In"
          variant="ghost"
          size="icon"
          onClick={() => zoomIn({ duration: 300 })}
          className="size-10"
        >
          <Plus className="size-5" />
        </Button>
      </div>
      <Button
        className={cn(
          "tabular-nums",
          orientation === "horizontal"
            ? "w-20 min-w-10 h-10"
            : "h-10 w-10",
          "text-sm"
        )}
        variant="ghost"
        onClick={() => zoomTo(1, { duration: 300 })}
      >
        {(100 * zoom).toFixed(0)}%
      </Button>
      <Button
        aria-label="Fit View"
        variant="ghost"
        size="icon"
        onClick={() => fitView({ duration: 300 })}
        className="size-10"
      >
        <Maximize className="size-5" />
      </Button>
      <Button
        aria-label="Lock"
        variant="ghost"
        size="icon"
        onClick={() => setLocked(!locked)}
        className="size-10"
      >
        {locked ? <LockOpen className="size-5"/> : <Lock className="size-5"/>}
      </Button>
    </Panel>
  );
}

import {cn} from "@/lib/utils.ts";
import React from "react";

type CircleIconButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type TooltipPosition = "top" | "bottom" | "left" | "right";

interface CircleIconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
  size?: CircleIconButtonSize;
  tooltipPosition?: TooltipPosition;
  className?: string;
  bigTooltip?: boolean;
}

const sizeStyles: Record<CircleIconButtonSize, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

const tooltipPositionStyles: Record<TooltipPosition, string> = {
  top: "tooltip-top",
  bottom: "tooltip-bottom",
  left: "tooltip-left",
  right: "tooltip-right",
};

const CircleIconButton = (
  {
    onClick,
    children,
    title,
    disabled,
    size = "lg",
    tooltipPosition = "top",
    className,
    bigTooltip = false,
  }: CircleIconButtonProps) => {

  return (

    <div className={cn(
      "tooltip",
      tooltipPositionStyles[tooltipPosition],
      bigTooltip ? "[&::before]:text-2xl" : ""
    )}
         data-tip={title}
    >

      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn btn-circle btn-ghost",
          className,
          sizeStyles[size],
          disabled ? "opacity-70 cursor-not-allowed" : "hover:opacity-100"
        )}
      >

        {children}

      </button>
    </div>
  );
};

export default CircleIconButton;
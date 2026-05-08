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
  }: CircleIconButtonProps) => {

  return (

    <div className={cn(
      "tooltip",
      tooltipPositionStyles[tooltipPosition]
    )}
         data-tip={title}
    >

      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn btn-circle btn-ghost btn-default border",
          className,
          sizeStyles[size],
        )}
      >

        {children}

      </button>
    </div>
  );
};

export default CircleIconButton;
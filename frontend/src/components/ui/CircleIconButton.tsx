// components/ui/CircleIconButton.tsx

import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import React from "react";

type CircleIconButtonSize = "sm" | "md";
type TooltipPosition = "top" | "bottom";

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
  sm: "w-8 h-8",
  md: "w-12 h-12",
};

const tooltipPositionStyles: Record<TooltipPosition, string> = {
  top: "bottom-full mb-1",
  bottom: "top-full mt-1",
};

const CircleIconButton = ({
                            onClick,
                            children,
                            title,
                            disabled,
                            size = "md",
  tooltipPosition = "top",
                            className,
                          }: CircleIconButtonProps) => {
  return (
    <div className="relative group">
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "rounded-full bg-transparent",
          "transition-opacity duration-200",
          "hover:opacity-70 hover:bg-black/10",
          "disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed",
          sizeStyles[size],
          className
        )}
      >
        {children}
      </Button>

      {title && !disabled && (
        <span className={cn(
          "absolute left-1/2 -translate-x-1/2 mb-1",
          tooltipPositionStyles[tooltipPosition],
          "px-2 py-1 text-xs whitespace-nowrap",
          "bg-gray-800 text-white rounded",
          "pointer-events-none",
          "opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        )}>
          {title}
        </span>
      )}
    </div>
  );
};

export default CircleIconButton;
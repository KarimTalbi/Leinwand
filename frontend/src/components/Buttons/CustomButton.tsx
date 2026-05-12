import {cn} from "@/lib/utils.ts";
import React from "react";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
type ButtonStyle = "default" | "circle" | "square";

interface CircleIconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  size?: ButtonSize;
  className?: string;
  buttonStyle?: ButtonStyle;
}


const buttonStyles: Record<ButtonStyle, string> = {
  default: "",
  circle: "btn-circle",
  square: "btn-square",
};

const buttonSizes: Record<ButtonSize, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};


const CustomButton = (
  {
    onClick,
    children,
    disabled,
    size,
    className,
    buttonStyle,
  }: CircleIconButtonProps) => {

  return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn btn-ghost hover:bg-base-300 border-none",
          buttonStyles[buttonStyle || "default"],
          buttonSizes[size || "md"],
          className,
          disabled ? "opacity-70 cursor-not-allowed" : "hover:opacity-100"
        )}
      >

        {children}

      </button>
  );
};

export default CustomButton;
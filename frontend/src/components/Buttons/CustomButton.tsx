import {cn} from "@/lib/utils.ts";
import React from "react";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonStyle = "default" | "circle" | "square";
export type ButtonColor = "primary" | "secondary" | "accent" | "ghost" | "link" | "default" | "neutral" | "error";

interface CircleIconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  size?: ButtonSize;
  color?: ButtonColor;
  className?: string;
  buttonStyle?: ButtonStyle;
}

const buttonColors: Record<ButtonColor, string> = {
  default: "btn-default",
  neutral: "btn-neutral",
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  ghost: "btn-ghost hover:bg-base-300",
  link: "btn-link",
  error: "btn-error",
};

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
    color,
    className,
    buttonStyle,
  }: CircleIconButtonProps) => {

  return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn  border-none",
          buttonStyles[buttonStyle || "default"],
          buttonSizes[size || "md"],
          buttonColors[color || "ghost"],
          className,
          disabled ? "opacity-70 cursor-not-allowed" : "hover:opacity-100",
        )}
      >

        {children}

      </button>
  );
};

export default CustomButton;
import {LucideIcon} from "lucide-react";
import React from "react";
import {cn} from "@/lib/utils.ts";
import {controlBarButtonStyle, controlBarFieldStyle, tooltipStyle} from "@/lib/styles.ts";
import getIcon from "@/lib/icons.tsx";

type toolTipPosition = "top" | "bottom" | "left" | "right"

const TipPos: Record<toolTipPosition, string> = {
  top: "tooltip-top",
  bottom: "tooltip-bottom",
  left: "tooltip-left",
  right: "tooltip-right",
}


interface ToolTipProps extends React.ComponentPropsWithRef<"div"> {
  label: string,
  position?: toolTipPosition,
  disabled?: boolean,
}

interface CustomButtonProps extends React.ComponentPropsWithRef<"button"> {
  icon?: LucideIcon,
  iconSize?: number,
  iconColor?: string,
  tooltipDisabled?: boolean,
  tooltipLabel?: string,
  tooltipPosition?: toolTipPosition,
}

export interface ControlBarFieldProps extends React.ComponentPropsWithRef<"div"> {
  buttons: CustomButtonProps[];
}


export const ToolTip = ({position, children, className, label, disabled, ...props}: ToolTipProps) => {
  if (disabled) return (
    <>
      {children}
    </>
  );

  return (
    <div className={cn(tooltipStyle, TipPos[position || "top"], className)} data-tip={label} {...props}>
      {children}
    </div>
  )
}


export const CustomButton = (
  {
    icon,
    iconSize,
    iconColor,
    className,
    onClick,
    children,
    tooltipDisabled,
    tooltipPosition,
    tooltipLabel,
    ...props
  }: CustomButtonProps
) => {


  return (
    <ToolTip position={tooltipPosition} label={tooltipLabel || ""} disabled={tooltipDisabled}>
      <button className={className} onClick={onClick} {...props}>
        {icon && (getIcon({icon, size: iconSize || 14, color: iconColor}))}
        {children}
      </button>
    </ToolTip>
  )
}


export const ControlBarField = ({buttons, className, ...props}: ControlBarFieldProps) => {

  return (
    <div className={cn(controlBarFieldStyle, className)} {...props}>
      {buttons.map((button, index) => (
          <CustomButton key={index} className={controlBarButtonStyle} {...button}/>
      ))}
    </div>
  )
}

import {LucideIcon, LucideProps} from "lucide-react";
import React from "react";
import {cn} from "@/lib/utils.ts";
import {controlBarButtonStyle, controlBarFieldStyle, defaultButtonSize, tooltipStyle} from "@/lib/styles.ts";
import getIcon from "@/lib/icons.tsx";

type toolTipPosition = "top" | "bottom" | "left" | "right"

const TipPos: Record<toolTipPosition, string> = {
  top: "tooltip-top",
  bottom: "tooltip-bottom",
  left: "tooltip-left",
  right: "tooltip-right",
}


interface ToolTipProps extends React.ComponentPropsWithRef<"div"> {
  label?: string,
  position?: toolTipPosition,
}

export interface CustomButtonProps extends React.ComponentPropsWithRef<"button"> {
  icon?: LucideIcon,
  iconProps?: LucideProps,
  tooltipDisabled?: boolean,
  tooltipLabel?: string,
  tooltipPosition?: toolTipPosition,
}

export interface ControlBarFieldProps extends React.ComponentPropsWithRef<"div"> {
  buttons: CustomButtonProps[];
}


export const ToolTip = ({position, children, className, label, ...props}: ToolTipProps) => {
  if (!label) return (
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
    iconProps,
    className,
    onClick,
    children,
    tooltipDisabled,
    tooltipPosition,
    tooltipLabel,
    ...props
  }: CustomButtonProps
) => {

  const iconSize = iconProps?.size || defaultButtonSize;
  const iconColor = iconProps?.color || "#737373";

  return (
    <ToolTip position={tooltipPosition} label={tooltipLabel || ""}>
      <button className={className} onClick={onClick} {...props}>
        {icon && (getIcon({icon, size: iconSize, color: iconColor, ...iconProps}))}
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

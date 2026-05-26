import {
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronUp,
  LucideIcon,
  LucideProps,
  LucideX,
} from "lucide-react";
import {nodeHeaderButtonStyle} from "@/lib/styles.ts";
import React from "react";
import getIcon from "@/lib/icons.tsx";
import {CustomButton, CustomButtonProps} from "@/components/ui/UiElements.tsx";
import {useNodeMove} from "@/hooks/useNodeMove.ts";
import {useStoreWithId} from "@/hooks/useStoreWithId.ts";

interface HeaderProps {
  title: string,
  color: string,
  id: string,
  loading?: boolean
  icon?: LucideIcon,
  iconProps?: LucideProps,
  children?: React.ReactNode
}

export const NodeHeader = ({title, color, id, loading = false, icon, iconProps, children}: HeaderProps) => {
  const {deleteNodeAction} = useStoreWithId(id);
  const {moveUp, moveLeft, moveRight, moveDown} = useNodeMove(id)

  const iconSize = iconProps?.size || 12;
  const iconColor = iconProps?.color || color;

  const iconPropsEnd = {size: iconSize, color: iconColor, ...iconProps}

  const globalButtonProps: CustomButtonProps = {
    className: nodeHeaderButtonStyle,
    iconProps: {size: iconSize, color: iconColor, ...iconProps},
    disabled: loading
  }

  const buttonProps: CustomButtonProps[] = [
    {icon: LucideChevronUp, onClick: moveUp, ...globalButtonProps},
    {icon: LucideChevronDown, onClick: moveDown, ...globalButtonProps},
    {icon: LucideChevronLeft, onClick: moveLeft, ...globalButtonProps},
    {icon: LucideChevronRight, onClick: moveRight, ...globalButtonProps},
    {icon: LucideX, onClick: deleteNodeAction, ...globalButtonProps}
  ]


  return (
    <div className="flex items-center justify-between shrink-0 pl-2">
      <div className="flex items-center gap-1.5">

        {icon ? getIcon({icon: icon, ...iconPropsEnd}) : null}

        <h1 className="flex items-center gap-1 text-xs font-semibold">{title}</h1>
      </div>

      {children}

      <div className="flex items-center">

        {buttonProps.map((button, index) => (
          <CustomButton key={index} {...button}/>
        ))}

      </div>
    </div>
  )
}


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
import {CustomButton} from "@/components/ui/UiElements.tsx";
import {useNodeMove} from "@/hooks/useNodeMove.ts";
import {useStoreWithId} from "@/hooks/useStoreWithId.ts";

interface HeaderProps {
  title: string,
  color: string,
  id: string,
  loading?: boolean
  icon?: LucideIcon,
  iconProps?: LucideProps,
  children? : React.ReactNode
}

export const NodeHeader = ({title, color, id, loading = false, icon, iconProps, children}: HeaderProps) => {
  const {deleteNodeAction} = useStoreWithId(id);
  const {moveUp, moveLeft, moveRight, moveDown} = useNodeMove(id)

  const iconSize = iconProps?.size || 12;
  const iconColor = iconProps?.color || color;

  const iconPropsEnd = {size: iconSize, color: iconColor, ...iconProps}

  return (
    <div className="flex items-center justify-between shrink-0 pl-2">
      <div className="flex items-center gap-1.5">

        {icon ? getIcon({icon: icon, ...iconPropsEnd}) : null}

        <h1 className="flex items-center gap-1 text-xs font-semibold">{title}</h1>
      </div>

        {children}

      <div className="flex items-center gap-1">

        <CustomButton
          icon={LucideChevronUp}
          iconProps={iconPropsEnd}
          className={nodeHeaderButtonStyle}
          onClick={moveUp} disabled={loading}
        />

        <CustomButton
          icon={LucideChevronDown}
          iconProps={iconPropsEnd}
          className={nodeHeaderButtonStyle}
          onClick={moveDown} disabled={loading}
        />

        <CustomButton
          icon={LucideChevronLeft}
          iconProps={iconPropsEnd}
          className={nodeHeaderButtonStyle}
          onClick={moveLeft} disabled={loading}
        />


        <CustomButton
          icon={LucideChevronRight}
          iconProps={iconPropsEnd}
          className={nodeHeaderButtonStyle}
          onClick={moveRight} disabled={loading}
        />


        <CustomButton
          icon={LucideX}
          className={nodeHeaderButtonStyle}
          iconProps={iconPropsEnd}
          onClick={deleteNodeAction} disabled={loading}
        >
        </CustomButton>

      </div>
    </div>
  )
}


import {Button} from "@/components/ui/button.tsx";
import React from "react";


interface NavbarButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}


const NavbarButton = ({onClick, disabled, children}: NavbarButtonProps) => {
  return (
    <Button onClick={onClick} disabled={disabled}
            className="transition-opacity w-12 h-12 bg-transparent duration-200 rounded-full
                hover:opacity-70 hover:bg-black/10 disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed">

      {children}
    </Button>
  )
};

const NavBarButtonGroup = ({children}: { children?: React.ReactNode }) => (
  <div
    className="flex flex-row items-center justify-between bg-white/50 rounded-full shadow-md backdrop-blur-sm">
    {children}
  </div>
)

const SyncIndicator = ({children, syncing}: { children?: React.ReactNode, syncing: boolean }) => (
  <div
    className="z-50 flex items-center gap-2 rounded-full px-3 py-3">
    <span className="text-s font-semibold text-black/80">{children}</span>
    <div
      className={`h-2.5 w-2.5 rounded-full ${syncing ? 'animate-pulse bg-yellow-400' : 'bg-green-500'}`}/>
  </div>
)

export {NavbarButton, NavBarButtonGroup, SyncIndicator}
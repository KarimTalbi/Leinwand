import React from "react";

import {Button} from "@/components/ui/button.tsx";


interface NavbarButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  title?: string;
}


const NavbarButton = ({onClick, disabled, children, title}: NavbarButtonProps) => {
  return (
    <div className="relative group">
      <Button onClick={onClick} disabled={disabled}
              className="transition-opacity w-12 h-12 bg-transparent duration-200 rounded-full
                hover:opacity-70 hover:bg-black/10 disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed">

        {children}
        <span
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-pointer-events-none whitespace-nowrap">
          {title}
        </span>
      </Button>
    </div>

  )
};


const NavBarButtonGroup = ({children}: { children?: React.ReactNode }) => (

  <div
    className="flex flex-row items-center justify-between bg-white/50 rounded-full shadow-md backdrop-blur-sm">

    {children}

  </div>

)

const SyncIndicator = ({label, syncing}: { label: string, syncing: boolean }) => (

  <div
    className="z-50 flex items-center gap-2 rounded-full px-3 py-3">

    <span className="text-s font-semibold text-black/80">{label}</span>

    <div
      className={`h-2.5 w-2.5 rounded-full ${syncing ? 'animate-pulse bg-yellow-400' : 'bg-green-500'}`}/>

  </div>

)

export {NavbarButton, NavBarButtonGroup, SyncIndicator}
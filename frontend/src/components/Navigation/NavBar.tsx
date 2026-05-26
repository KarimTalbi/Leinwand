import React from "react";
import {CustomButton, CustomButtonProps, ToolTip} from "@/components/ui/UiElements.tsx";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {Folder, Hexagon, LucideChevronLeft, LucideLogOut, LucideSettings2, LucideSpline} from "lucide-react";
import {navbarButtonStyle} from "@/lib/styles.ts";

interface NavBarProps extends React.ComponentPropsWithRef<"div"> {
  centerChild?: React.ReactNode,
  endChild?: React.ReactNode,
}

export const Navbar = ({centerChild, endChild, ...props}: NavBarProps) => {
  return (
    <div
      style={{height: 50, maxHeight: 50, minHeight: 50, zIndex: 1000, position: "sticky", top: 0, left: 0, right: 0,}}
      className="bg-white w-full shadow-xs z-100 grid grid-cols-3 items-center border-b border-neutral-200" {...props}>

      <div>
        <h1 className="text-sm text-neutral-600 text-shadow-xs font-bold px-5">LEINWAND</h1>
      </div>

      <div className="flex justify-center">
        {centerChild || <div/>}
      </div>

      <div className="flex justify-end mr-2">
        {endChild || <div/>}
      </div>

    </div>
  );
};


const flowNavbarButtonProps: Partial<CustomButtonProps> = {
  tooltipDisabled: true,
  className: navbarButtonStyle,
}

export const FlowNavBar = () => {
  const {currentCanvasName, nodeCount, edgeCount, exitCanvas, setSettingsOpen} = useStore(useShallow(s => ({
    currentCanvasName: s.currentCanvasName,
    nodeCount: s.nodes.length,
    edgeCount: s.edges.length,
    exitCanvas: s.exitCanvas,
    setSettingsOpen: s.setSettingsOpen,
  })));

  return (
    <Navbar centerChild={

      <div className="flex items-center gap-3 text-[10px] text-neutral-500">

        <ToolTip label="Project Title" position="bottom">
          <div className="flex items-center gap-1">
            <Folder size={10}/><p>{currentCanvasName}</p>
          </div>
        </ToolTip>

        <ToolTip label="Node Count" position="bottom">
          <div className="flex items-center gap-1">
            <Hexagon size={10}/><p>{nodeCount}</p>
          </div>
        </ToolTip>

        <ToolTip label="Edge Count" position="bottom">
          <div className="flex items-center gap-1">
            <LucideSpline size={10}/><p>{edgeCount}</p>
          </div>
        </ToolTip>

      </div>

    } endChild={

      <div className="flex gap-1">

        <CustomButton icon={LucideChevronLeft} onClick={exitCanvas} {...flowNavbarButtonProps}>Exit</CustomButton>
        <CustomButton icon={LucideSettings2} onClick={setSettingsOpen} {...flowNavbarButtonProps}>Settings</CustomButton>

      </div>

    }/>
  )
}


export const DashboardNavbar = () => {
  const {logout, setSettingsOpen} = useStore(useShallow(s => ({logout: s.logout, setSettingsOpen: s.setSettingsOpen,})));

  return (
    <Navbar
      endChild={
      <>
        <CustomButton icon={LucideLogOut} className={navbarButtonStyle} onClick={logout}>Log Out</CustomButton>
        <CustomButton icon={LucideSettings2} onClick={setSettingsOpen} {...flowNavbarButtonProps}>Settings</CustomButton>
      </>
      }
    />
  )
}

export const SettingsNavbar = () => {
  const {setSettingsOpen} = useStore(useShallow(s => ({setSettingsOpen: s.setSettingsOpen,})));
  return (
    <Navbar
    endChild={
      <CustomButton icon={LucideChevronLeft} onClick={setSettingsOpen} {...flowNavbarButtonProps}>Exit</CustomButton>
    }
    />
  )
}
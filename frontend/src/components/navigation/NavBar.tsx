import React from "react";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {ChevronLeft, LogOut, Settings2} from "lucide-react";
import {bgColor, buttonStyle, navbarButtonStyle, navbarStyle, text} from "@/lib/styles.ts";
import {Panel} from "@xyflow/react";
import {cn} from "@/lib/utils.ts";

export const Navbar = ({children, ...props}: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      style={{zIndex: 100, position: "sticky", top: 0, left: 0, right: 0, height: "55px"}}
      className={cn("nodrag nowheel flex flex-row items-center justify-between w-full", text)}
      {...props}
    >
      <div>
        <h1 className={cn(text, "text-neutral-600 text-shadow-xs font-bold px-5")}>LEINWAND</h1>
      </div>

      {children}

    </div>
  );
};

export const FlowNavBar = ({children}: { children?: React.ReactNode }) => {
  const {exitCanvas, setSettingsOpen} = useStore(useShallow(s => ({
    exitCanvas: s.exitCanvas,
    setSettingsOpen: s.setSettingsOpen,
  })));

  return (
    <Panel position="top-right">

      <div
        className={navbarStyle}>

        <div>
          <h1 className="text-neutral-600 text-shadow-xs font-bold px-5 dark:text-neutral-100">LEINWAND</h1>
        </div>

        {children}


        <div className="tooltip tooltip-bottom" data-tip="Exit Project">
          <button className={navbarButtonStyle} onClick={exitCanvas}>
            <ChevronLeft size={16}/>
          </button>
        </div>


        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button className={navbarButtonStyle} onClick={setSettingsOpen}>
            <Settings2 size={16}/>
          </button>
        </div>

      </div>

    </Panel>
  )
}

export const DashboardNavbar = () => {
  const {logout} = useStore(useShallow(s => ({
    logout: s.logout,
  })));

  return (
    <Navbar>
      <div className="flex gap-1 mr-4">

        <button className={cn(buttonStyle, "btn-ghost btn-sm", bgColor)} onClick={logout}>
          <LogOut size={16}/>
          <p>Log Out</p>
        </button>

      </div>
    </Navbar>
  )
}

export const SettingsNavbar = () => {
  const {setSettingsOpen} = useStore(useShallow(s => ({setSettingsOpen: s.setSettingsOpen,})));
  return (
    <Navbar>
      <div className="flex gap-2 mr-4">

        <button className={cn(text, "btn btn-sm btn-ghost hover:bg-neutral-900")} onClick={setSettingsOpen}>
          <ChevronLeft size={16}/>
          <p>Exit</p>
        </button>


      </div>
    </Navbar>
  )
}

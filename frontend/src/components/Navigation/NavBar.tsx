import React from "react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {ChevronLeft, LogOut, Settings2} from "lucide-react";


export const Navbar = ({children, ...props}: React.ComponentPropsWithoutRef<"div">) => {
  return (
    <div
      style={{zIndex: 100, position: "sticky", top: 0, left: 0, right: 0, height: "55px"}}
      className="nodrag nowheel bg-neutral-50 shadow-sm flex flex-row items-center justify-between"
      {...props}
    >
      <div>
        <h1 className="text-neutral-600 text-shadow-xs font-bold px-5">LEINWAND</h1>
      </div>

      {children}

    </div>
  );
};


export const FlowNavBar = () => {
  const {exitCanvas, setSettingsOpen} = useStore(useShallow(s => ({
    exitCanvas: s.exitCanvas,
    setSettingsOpen: s.setSettingsOpen,
  })));

  return (
    <Navbar>

      <div className="flex gap-2 mr-2">

        <div className="tooltip tooltip-bottom" data-tip="Exit Project">
          <button className="btn btn-square btn-sm" onClick={exitCanvas}>
            <ChevronLeft size={14} color="#737373"/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button className="btn btn-square btn-sm" onClick={setSettingsOpen}>
            <Settings2 size={14} color="#737373"/>
          </button>
        </div>

      </div>

    </Navbar>
  )
}


export const DashboardNavbar = () => {
  const {logout, setSettingsOpen} = useStore(useShallow(s => ({
    logout: s.logout,
    setSettingsOpen: s.setSettingsOpen,
  })));

  return (
    <Navbar>
      <div className="flex gap-2 mr-2">

        <div className="tooltip tooltip-bottom" data-tip="Log Out">
          <button className="btn btn-square btn-sm" onClick={logout}>
            <LogOut size={14} color="#737373"/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button className="btn btn-square btn-sm" onClick={setSettingsOpen}>
            <Settings2 size={14} color="#737373"/>
          </button>
        </div>

      </div>
    </Navbar>
  )
}


export const SettingsNavbar = () => {
  const {setSettingsOpen} = useStore(useShallow(s => ({setSettingsOpen: s.setSettingsOpen,})));
  return (
    <Navbar>
      <div className="flex gap-2 mr-2">

        <div className="tooltip tooltip-bottom" data-tip="Back">
          <button className="btn btn-square btn-sm" onClick={setSettingsOpen}>
            <ChevronLeft size={14} color="#737373"/>
          </button>
        </div>

      </div>
    </Navbar>
  )
}
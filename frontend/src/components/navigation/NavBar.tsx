import React from "react";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {ChevronLeft, LogOut, Settings2} from "lucide-react";
import {navbarButtonStyle} from "@/lib/styles.ts";

/**
 * Base Navbar component that provides the common layout and styling for all navbars.
 * Features a fixed position at the top with a title and dynamic children elements.
 *
 * @param children - The content to be rendered on the right side of the navbar
 * @param props - Additional HTML div element properties
 * @returns A sticky top navigation bar
 */
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

/**
 * Navigation bar used within the flow/canvas view.
 * Contains buttons to exit the project and open the settings panel.
 *
 * @returns The flow-specific navigation bar component
 */
export const FlowNavBar = () => {
  const {exitCanvas, setSettingsOpen} = useStore(useShallow(s => ({
    exitCanvas: s.exitCanvas,
    setSettingsOpen: s.setSettingsOpen,
  })));

  return (
    <Navbar>

      <div className="flex gap-2 mr-2">

        <div className="tooltip tooltip-bottom" data-tip="Exit Project">
          <button className={navbarButtonStyle} onClick={exitCanvas}>
            <ChevronLeft size={14} color="#737373"/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button className={navbarButtonStyle} onClick={setSettingsOpen}>
            <Settings2 size={14} color="#737373"/>
          </button>
        </div>

      </div>

    </Navbar>
  )
}

/**
 * Navigation bar used on the main dashboard view.
 * Contains buttons to log out of the application and open the settings panel.
 *
 * @returns The dashboard-specific navigation bar component
 */
export const DashboardNavbar = () => {
  const {logout, setSettingsOpen} = useStore(useShallow(s => ({
    logout: s.logout,
    setSettingsOpen: s.setSettingsOpen,
  })));

  return (
    <Navbar>
      <div className="flex gap-2 mr-2">

        <div className="tooltip tooltip-bottom" data-tip="Log Out">
          <button className={navbarButtonStyle} onClick={logout}>
            <LogOut size={14} color="#737373"/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button className={navbarButtonStyle} onClick={setSettingsOpen}>
            <Settings2 size={14} color="#737373"/>
          </button>
        </div>

      </div>
    </Navbar>
  )
}

/**
 * Navigation bar used when the settings panel or view is active.
 * Contains a back button to close the settings view.
 *
 * @returns The settings-specific navigation bar component
 */
export const SettingsNavbar = () => {
  const {setSettingsOpen} = useStore(useShallow(s => ({setSettingsOpen: s.setSettingsOpen,})));
  return (
    <Navbar>
      <div className="flex gap-2 mr-2">

        <div className="tooltip tooltip-bottom" data-tip="Back">
          <button className={navbarButtonStyle} onClick={setSettingsOpen}>
            <ChevronLeft size={14} color="#737373"/>
          </button>
        </div>

      </div>
    </Navbar>
  )
}

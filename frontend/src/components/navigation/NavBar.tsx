import React from "react";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {Bot, Folder, User2} from "lucide-react";
import {navbarButtonStyle, navbarStyle} from "@/lib/styles.ts";
import {Panel} from "@xyflow/react";
import AiSettings from "@/components/pages/AiSettings.tsx";
import Dashboard from "@/components/pages/Dashboard.tsx";
import LoginPage from "@/components/pages/LoginPage.tsx";
import UserSettings from "@/components/pages/UserSettings.tsx";

export const FlowNavBar = ({children}: { children?: React.ReactNode }) => {
  const {
    token,
    loginOpen,
    projectsOpen,
    setLoginOpen,
    setProjectsOpen,
    setAiSettingsOpen,
    aiSettingsOpen,
  } = useStore(useShallow(s => ({
    setAiSettingsOpen: s.setAiSettingsOpen,
    aiSettingsOpen: s.aiSettingsOpen,
    setUserSettingsOpen: s.setUserSettingsOpen,
    userSettingsOpen: s.userSettingsOpen,
    setProjectsOpen: s.setProjectsOpen,
    projectsOpen: s.projectsOpen,
    setLoginOpen: s.setLoginOpen,
    loginOpen: s.loginOpen,
    logout: s.logout,
    token: s.token
  })));

  return (
    <Panel position="top-right">

      <div className="flex flex-col gap-3">
        <div className={navbarStyle}>

          <div>
            <h1 className="text-neutral-600 text-shadow-xs font-bold px-5 dark:text-neutral-100">LEINWAND</h1>
          </div>

          <div className="flex flex-row gap-1">

            {children}


            <div className="tooltip tooltip-bottom" data-tip="View Projects">
              <button className={navbarButtonStyle} onClick={() => setProjectsOpen(!projectsOpen)} disabled={!token}>
                <Folder size={16}/>
              </button>
            </div>


            <div className="tooltip tooltip-bottom" data-tip="Ai Settings">
              <button className={navbarButtonStyle} onClick={() => setAiSettingsOpen(!aiSettingsOpen)}
                      disabled={!token}>
                <Bot size={16}/>
              </button>
            </div>

            <div className="tooltip tooltip-bottom" data-tip="User Settings">
              <button className={navbarButtonStyle} onClick={() => setLoginOpen(!loginOpen)}
                      disabled={!token}>
                <User2 size={16}/>
              </button>
            </div>

          </div>


        </div>

        {aiSettingsOpen && (
          <AiSettings/>
        )}

        {projectsOpen && (
          <Dashboard/>
        )}

        {loginOpen && (
          <>
            {!token
              ? <LoginPage/>
              : <UserSettings/>
            }
          </>
        )}

      </div>

    </Panel>
  )
}

import {CustomButton, CustomButtonProps} from "@/components/ui/UiElements.tsx";
import React from "react";
import {ContextMenuState} from "@/hooks/useFlowContextMenu.ts"

interface ContextMenuProps {
  closeMenu: () => void,
  menuStyle: React.CSSProperties,
  contextMenuButtons: CustomButtonProps[],
  viewportButton: CustomButtonProps,
  menu: ContextMenuState | null,
}

const ContextMenu = (
  {
    closeMenu, menuStyle, contextMenuButtons, viewportButton, menu}:
  ContextMenuProps
) => {


  return (
    <>
      {menu && (
        <>
          <div style={{position: 'fixed', inset: 0, zIndex: 10}} onMouseDown={closeMenu}/>
          <div style={{position: 'fixed', ...menuStyle, zIndex: 100}}>

            <ul className="menu bg-white rounded-box ring-1 ring-neutral-200 w-50">

              <div
                className="px-0.5 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 select-none">
                Add Node

                {contextMenuButtons.map((button, index) => (
                  <li key={index} className="tracking-normal">
                    <CustomButton {...button}/>
                  </li>
                ))}

              </div>

              <div className="my-1 border-t-2 border-gray-100"/>

              <div
                className="px-0.5 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
                Viewport

                <li className="tracking-normal">
                  <CustomButton {...viewportButton}/>
                </li>

              </div>

            </ul>
          </div>
        </>
      )}
    </>
  )
}

export default ContextMenu;
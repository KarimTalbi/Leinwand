import {Panel} from "@xyflow/react";
import {NavbarButton, NavBarButtonGroup, SyncIndicator} from "@/components/navbar/navbarelements.tsx";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {Plus} from "lucide-react";
import {JSX} from "react";

interface NavbarProps {
  controls: { icon: JSX.Element, onClick: () => void }[];
  undoControls: { icon: JSX.Element, onClick: () => void }[];
  addItem: { text: string, onClick: () => void }[];
  syncing: boolean;
}


const NavigationBar = ({controls, undoControls, addItem, syncing}: NavbarProps) => {
  return (
    <div>
      <Panel position="top-left" className="flex flex-row items-center justify-between gap-4">

        <NavBarButtonGroup>

          {controls.map((c, i) => (
            <NavbarButton key={i} onClick={c.onClick}>
              {c.icon}
            </NavbarButton>
          ))}

        </NavBarButtonGroup>

        <NavBarButtonGroup>

          <Menu>

            <MenuButton
              className="inline-flex items-center h-12 rounded-full px-3 py-1 data-hover:bg-black/10">
              <Plus className="size-6 text-black"/>
            </MenuButton>

            <MenuItems
              transition
              anchor='bottom'
              className="origin-top rounded-xl bg-white/50 backdrop-blur-md p-1 text-sm/6 font-semibold shadow-md
                transition duration-100 ease-out [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:opacity-0"
            >

              {addItem.map((item, index) => (
                <MenuItem key={index}>
                  <button onClick={item.onClick}
                          className="group rounded-lg px-2 py-1.5 data-focus:bg-black/10">
                    {item.text}
                  </button>
                </MenuItem>
              ))}

            </MenuItems>

          </Menu>


        </NavBarButtonGroup>

        <NavBarButtonGroup>

          {undoControls.map((u, i) => (
            <NavbarButton key={i} onClick={u.onClick}>
              {u.icon}
            </NavbarButton>
          ))}

        </NavBarButtonGroup>

      </Panel>

      <Panel position="top-right" className="flex flex-row items-center justify-between gap-4">

        <NavBarButtonGroup>

          <SyncIndicator syncing={syncing}>
            Status
          </SyncIndicator>

        </NavBarButtonGroup>

      </Panel>
    </div>
  )
};

export default NavigationBar;
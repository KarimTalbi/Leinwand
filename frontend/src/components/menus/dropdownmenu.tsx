import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {Plus} from "lucide-react";


const DropdownMenu = ({items}: { items: { text: string; onClick: () => void }[] }) => {
  return (
    <div>
      <Menu>

        <MenuButton
          className="inline-flex items-center h-12 rounded-full px-3 py-1 data-hover:bg-black/10 data-focus:outline-none">
          <Plus className="size-6 text-black"/>
        </MenuButton>

        <MenuItems
          transition
          anchor='bottom'
          className="origin-top-left flex flex-col rounded-xl bg-white/50 backdrop-blur-md p-1 text-sm/6 font-semibold shadow-md
                transition duration-100 ease-out [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:opacity-0"
        >

          {items.map((item, index) => (
            <MenuItem key={index}>
              <button onClick={item.onClick}
                      className="group rounded-lg px-2 py-1.5 data-focus:bg-black/10">
                {item.text}
              </button>
            </MenuItem>
          ))}

        </MenuItems>

      </Menu>
    </div>
  )
}

export default DropdownMenu;
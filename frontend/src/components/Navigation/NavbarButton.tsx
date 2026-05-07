import {Button} from "@/components/ui/button.tsx";

import {NavbarButtonProps} from "@/types/NavigationTypes.ts";


const NavbarButton = ({onClick, disabled, children, title}: NavbarButtonProps) => {
  return (
    <div className="relative group">
      <Button onClick={onClick} disabled={disabled}
              className="transition-opacity w-12 h-12 bg-transparent duration-200 rounded-full
                hover:opacity-70 hover:bg-black/10 disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed">

        {children}

      </Button>
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-pointer-events-none whitespace-nowrap">
          {title}
        </span>
    </div>

  )
};

export default NavbarButton;
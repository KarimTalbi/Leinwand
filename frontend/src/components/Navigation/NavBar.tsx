import React from "react";
import {CustomButton} from "@/components/ui/UiElements.tsx";
import {useNavbar} from "@/hooks/useNavbar.ts";

interface NavBarProps extends React.ComponentPropsWithRef<"div"> {
  centerChild?: React.ReactNode,
  endChild?: React.ReactNode,
}

export const Navbar = ({centerChild, endChild, ...props}: NavBarProps) => {
  return (
    <div className="navbar bg-white h-12 w-full shadow-sm z-100 grid grid-cols-3 items-center border-b border-neutral-200" {...props}>

      <div>
        <h1 className="text-lg text-neutral-600 text-shadow-xs font-bold px-5">LEINWAND</h1>
      </div>

      <div className="flex justify-center">
        {centerChild || <div/>}
      </div>

      <div className="flex justify-end">
        {endChild || <div/>}
      </div>

    </div>
  );
};


export const FlowNavBar = () => {
  const {navbarCenterChild, navbarEndChild} = useNavbar()


  return (
    <Navbar centerChild={
      <div className="flex gap-2 mr-2 text-sm items-center">
        {navbarCenterChild.map((props, i) => (<CustomButton key={i} {...props}/>))}
      </div>
    } endChild={
      <div className="flex gap-1 mr-2">
        {navbarEndChild.map((props, i) => (<CustomButton key={i} {...props}/>))}
      </div>
    }/>
  )
}
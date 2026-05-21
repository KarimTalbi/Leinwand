import React from "react";

interface NavBarProps {
  child1?: React.ReactNode,
  child2?: React.ReactNode,
  child3?: React.ReactNode,
  child4?: React.ReactNode,
}

export const Navbar = ({child1, child2, child3, child4}: NavBarProps) => {
  return (
    <div className="navbar bg-white h-12 shadow-sm z-100 grid grid-cols-5 items-center border-b border-neutral-200">

      <div>
        <h1 className="text-lg text-neutral-600 text-shadow-xs font-bold px-5">LEINWAND</h1>
      </div>

      <div className="flex justify-center">
        {child1 || <div/>}
      </div>

      <div className="flex justify-center">
        {child2 || <div/>}
      </div>

      <div className="flex justify-center">
        {child3 || <div/>}
      </div>

      <div className="flex justify-end">
        {child4 || <div/>}
      </div>

    </div>
  );
};
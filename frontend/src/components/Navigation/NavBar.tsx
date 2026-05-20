import React from "react";

export const Navbar = ({centerChild, endChild}: { centerChild?: React.ReactNode, endChild?: React.ReactNode }) => {
  return (
    <div
      className="navbar bg-white h-12 shadow-sm z-100 grid grid-cols-3 items-center border-b-2 border-stone-300"
    >
      <div>
        <h1 className="text-lg text-stone-600 font-bold px-5">LEINWAND</h1>
      </div>
      <div className="flex justify-center">
        {centerChild}
      </div>
      <div className="flex justify-end">
        {endChild}
      </div>
    </div>
  );
};
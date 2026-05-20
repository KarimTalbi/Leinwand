import React from "react";

export const Navbar = ({centerChild, endChild}: { centerChild?: React.ReactNode, endChild?: React.ReactNode }) => {
  return (
    <div className="navbar bg-base-100/70 backdrop-blur-md shadow-sm z-100 grid grid-cols-3 items-center">
      <div>
        <h1 className="text-xl font-bold px-3">LEINWAND</h1>
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
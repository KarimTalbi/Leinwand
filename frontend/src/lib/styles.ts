
export const nodeColors = {
  promptNode: '#ec4899',
  textNode: '#309898',
  mergeNode: '#f5c45e',
  summaryNode: '#bf4546',
};

export const innerButtonStyle = "btn btn-circle border bg-white border-stone-400 text-white hover:scale-105 transition-transform";
export const outerButtonStyle = "btn btn-circle border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const navbarButtonStyle = "btn border-none shadow-none bg-transparent text-xs text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform";

export const tooltipStyle = [
  "tooltip",
  "[--tt-bg:#a1a1a1]",
  "[&::before]:bg-[--tt-bg]",
  "[&::after]:border-b-[--tt-bg]",
  "[&::before]:font-semibold",
  "[&::before]:text-xs",
  "[&::before]:text-white",
  "[&::before]:delay-500",
  "[&::after]:delay-500",
].join(" ");

export const buttonNavbarStyle = [
  "btn btn-square btn-ghost btn-sm",
  "border-none shadow-none text-stone-600 bg-transparent",
  "hover:text-stone-900 hover:scale-110 transition-transform"
].join(" ");

export const nodeColors = {
  promptNode: '#ec4899',
  textNode: '#309898',
  mergeNode: '#f5c45e',
  summaryNode: '#bf4546',
};

export const innerButtonStyle = "btn btn-circle border bg-white border-stone-400 text-white hover:scale-105 transition-transform";
export const outerButtonStyle = "btn btn-circle shadow-none border border-stone-300 text-stone-600 bg-white hover:scale-105 transition-transform";

export const tooltipStyle = [
  "tooltip",
  "[--tt-bg:#d6d3d1]",
  "[&::before]:bg-[--tt-bg]",
  "[&::after]:border-b-[--tt-bg]",
  "[&::before]:font-semibold",
  "[&::before]:text-xs",
  "[&::before]:text-stone-600",
  "[&::before]:delay-500",
  "[&::after]:delay-500",
].join(" ");

export const buttonNavbarStyle = [
  "btn btn-square btn-ghost btn-sm",
  "border-none shadow-none text-stone-600 bg-transparent",
  "hover:text-stone-900 hover:scale-110 transition-transform"
].join(" ");
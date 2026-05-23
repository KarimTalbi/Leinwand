
export const nodeColors = {
  promptNode: '#ec4899',
  textNode: '#309898',
  mergeNode: '#f5c45e',
  summaryNode: '#bf4546',
};

export const innerButtonStyle = "btn btn-circle border bg-white border-stone-400 text-white hover:scale-105 transition-transform";
export const outerButtonStyle = "btn btn-circle border-none shadow-none bg-transparent text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";
export const navbarButtonStyle = "btn border-none shadow-none bg-transparent text-xs text-neutral-500 hover:text-neutral-800 hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-neutral-500";

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



export const NodeBackgroundStyle = "flex flex-col bg-white shadow-md ring-1 ring-neutral-200 w-130 rounded-xl px-1"
export const NodeForegroundStyle = "flex flex-col flex-1 min-h-0 p-2 rounded-lg"
export const textareaStyle = "textarea textarea-md nodrag w-auto resize-none bg-neutral-100 rounded-md outline-none"


export const pulsingText = "text-muted-foreground animate-pulse"
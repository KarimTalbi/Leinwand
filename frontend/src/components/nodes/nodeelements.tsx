import {Handle, Position} from "@xyflow/react";
import React, {JSX} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {cn} from "@/lib/utils.ts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


interface NodeHeaderButtonProps {
  onClick: () => void;
  icon: () => JSX.Element;
  disabled?: boolean;
}


interface NodeTextareaProps {
  placeholder?: string;
  value?: string;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}


const DefaultHandles = ({style}: { style?: React.CSSProperties }) => {
  return (
    <div>
      <Handle id="target-1" type="target" position={Position.Left}
              className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! -translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
      <Handle id="source-1" type="source" position={Position.Right}
              className="w-3! h-6! rounded-l-none! rounded-r-full! border-none! translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
    </div>
  )
};


const MergeHandles = ({style}: { style?: React.CSSProperties }) => {
  return (
    <div>
      <Handle id="target-1" type="target" position={Position.Left}
              className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! translate-y-20! -translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
      <Handle id="target-2" type="target" position={Position.Left}
              className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! -translate-y-20! -translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
      <Handle id="source-1" type="source" position={Position.Right}
              className="w-3! h-6! rounded-l-none! rounded-r-full! border-none! translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
    </div>
  )
}


const NodeHeaderButton = ({onClick, icon, disabled}: NodeHeaderButtonProps) => {
  return (
    <Button onClick={onClick} disabled={disabled}
            className="transition-opacity w-8 h-8 duration-200 bg-transparent rounded-full
                hover:opacity-70 hover:bg-transparent disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed">

      {icon()}
    </Button>
  )
};


const NodeTextarea = ({placeholder, value, handleTextChange}: NodeTextareaProps) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Textarea
        aria-label="Textarea"
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={cn(
          'nodrag flex-1 min-h-16 w-full resize-none rounded-xl border-none p-3 text-base text-black',
          'transition-all focus:ring ring-gray-300 outline-none ring-offset-4'
        )}
      />
    </div>
  )
};


const NodeMarkdown = ({children}: { children?: string }) => {
  return (
    <div
      className="flex-1 text-black p-3 rounded-xl min-h-0 overflow-y-auto nowheel">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 className="text-lg font-bold mb-3">{children}</h1>,
          h2: ({children}) => <h2 className="text-base font-bold mb-3">{children}</h2>,
          h3: ({children}) => <h3 className="text-xs font-bold mb-3">{children}</h3>,
          p: ({children}) => <p className="text-xs mb-3 whitespace-pre-wrap">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1">{children}</ol>,
          li: ({children}) => <li className="text-xs [&>p]:inline mb-3">{children}</li>,
          hr: () => <hr className="my-4 border-t border-gray-300"/>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}


export {DefaultHandles, MergeHandles, NodeHeaderButton, NodeTextarea, NodeMarkdown}
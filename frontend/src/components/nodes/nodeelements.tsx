import {Handle, Position, useNodeConnections} from "@xyflow/react";
import React, {JSX} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {cn} from "@/lib/utils.ts";
import ConnectionHandle from "@/components/nodes/createconnected.tsx";


interface NodeHeaderButtonProps {
  onClick: () => void;
  icon: () => JSX.Element;
  disabled?: boolean;
  title?: string;
}


interface NodeTextareaProps {
  placeholder?: string;
  value?: string;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}





const DefaultHandles = ({style, sourceId, posX, posY}: {
  style?: React.CSSProperties,
  sourceId: string,
  posX: number,
  posY: number
}) => {
  const connections = useNodeConnections({handleType: "target"});

  return (
    <div>
      <Handle id="target-1" type="target" position={Position.Left} isConnectable={connections.length === 0}
              className="w-4! h-8! rounded-l-full! rounded-r-none! border-none! -translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
      <ConnectionHandle sourceId={sourceId} posX={posX} posY={posY} style={style}/>
    </div>
  )
};


const MergeHandles = ({style, sourceId, posX, posY}: {
  style?: React.CSSProperties,
  sourceId: string,
  posX: number,
  posY: number
}) => {

  const isConnected = (handleId: string) => (
    useNodeConnections({handleId: handleId, handleType: "target"}).length > 0
  )

  return (
    <div>
      <Handle id="target-2" type="target" position={Position.Left} isConnectable={!isConnected("target-2")}
              className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! translate-y-20! -translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
      <Handle id="target-1" type="target" position={Position.Left} isConnectable={!isConnected("target-1")}
              className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! -translate-y-20! -translate-x-1! z-[-1]!"
              style={{...style, backgroundColor: 'var(--node-color)'}}/>
      <ConnectionHandle sourceId={sourceId} posX={posX} posY={posY} style={style}/>
    </div>
  )
}


const NodeHeaderButton = ({onClick, icon, disabled, title}: NodeHeaderButtonProps) => {
  return (


  <div className="relative group">
    <Button onClick={onClick} disabled={disabled}
            className="transition-opacity w-8 h-8 duration-200 bg-transparent rounded-full
                hover:opacity-70 hover:bg-transparent disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed">

      {icon()}

    </Button>
    <span
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 px-3 py-2 text-2xl bg-gray-800 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-pointer-events-none whitespace-nowrap">
          {title}
        </span>
  </div>
  )
};


const NodeTextarea = ({placeholder, value, handleTextChange}: NodeTextareaProps) => {
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <Textarea
        aria-label="Textarea"
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={cn(
          'nodrag flex-1 min-h-16 w-full resize-none rounded-xl border-none p-3 text-2xl! text-black',
          'transition-all focus:ring ring-gray-300 outline-none ring-offset-4'
        )}
      />
    </div>
  )
};

const NodeDisplayText = ({children}: { children?: string }) => {
  if (!children || children === 'thinking...') {
    return (
      <div className="flex-1 p-5 flex items-center justify-center">
        <span className="text-2xl! text-muted-foreground animate-pulse">thinking...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 text-2xl p-5 min-h-0 overflow-y-auto nowheel select-text nodrag cursor-text">
      {children?.split('\n').map((line, i) => (
        <span key={i} className="block mb-3">{line || '\u00A0'}</span>
      ))}
    </div>
  )
}


export {DefaultHandles, MergeHandles, NodeHeaderButton, NodeTextarea, NodeDisplayText}
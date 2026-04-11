import React from 'react';
import {Button} from "@/components/ui/button";
import {Handle, Position} from "@xyflow/react";
import {X} from "lucide-react";

interface BaseNodeProps {
  id: string;
  title: string;
  color: string;
  loading?: boolean;
  onDelete: () => void;
  style?: React.CSSProperties;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

const BaseNode = ({title, color, loading, onDelete, headerActions, children, style}: BaseNodeProps) => {
  return (
    <div className={`w-150 h-150 flex flex-col ${color} rounded-3xl shadow-md`}
    style={style}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-1 shrink-0">
        <div className="flex items-center gap-3">

          <Button
            onClick={onDelete}
            disabled={loading}
            className="transition-opacity w-8 h-8 duration-200 bg-transparent rounded-full hover:opacity-70 hover:bg-transparent disabled:opacity-30 disabled:bg-transparent disabled:cursor-not-allowed"
          >
            <X className="size-7 text-white"/>
          </Button>

          {headerActions}

        </div>
        <div className="text-xl text-white">{title}</div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-h-0 m-1 p-3 bg-white rounded-2xl">
        {children}
      </div>

      {/* Handles */}
      <Handle id="target-1" type="target" position={Position.Left}
              className="w-3! h-6! rounded-l-full! rounded-r-none! border-none! -translate-x-1! z-[-1]!"
              style={{backgroundColor: 'var(--node-color)'}}/>
      <Handle id="source-1" type="source" position={Position.Right}
              className="w-3! h-6! rounded-l-none! rounded-r-full! border-none! translate-x-1! z-[-1]!"
              style={{backgroundColor: 'var(--node-color)'}}/>
    </div>
  );
};

export default BaseNode;

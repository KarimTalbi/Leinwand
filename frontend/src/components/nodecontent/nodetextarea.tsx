import {Textarea} from '@/components/ui/textarea.tsx'
import {cn} from "@/lib/utils.ts";
import React from "react";

interface NodeTextareaProps {
  placeholder?: string;
  value: string;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

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

export default NodeTextarea;

import {Textarea} from "@/components/ui/textarea.tsx";
import {cn} from "@/lib/utils.ts";
import React, {useState} from "react";
import {useDebouncedCallback} from "use-debounce";
import useStore from "@/store.ts";
import DOMPurify from 'dompurify';
import {marked} from '@/lib/markdown.ts';

import 'highlight.js/styles/github-dark.css'

interface NodeTextareaProps {
  id: string,
  initialValue?: string,
  placeholder?: string
  dataKey?: string
}

interface NodeDisplayTextProps {
  children?: string
}

const maxHeight = "max-h-20";

export const NodeTextarea = ({id, initialValue, placeholder, dataKey = "prompt"}: NodeTextareaProps) => {

  const [localPrompt, setLocalPrompt] = useState(initialValue || "");
  const updateNodeData = useStore((s) => s.updateNodeData);

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateNodeData(id, {[dataKey]: value});
  }, 500);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value);
    debouncedUpdate(e.target.value);
  };

  return (
    <div className={cn("flex flex-col flex-1 min-h-0 w-full", dataKey === "solution" ? maxHeight : "")}>
      <Textarea
        aria-label="Textarea"
        value={localPrompt}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={cn(
          'nodrag flex-1 min-h-16 w-full resize-none rounded-sm border-none p-2 text-sm/5! text-black nowheel',
          'transition-all focus:ring ring-gray-300 outline-none ring-offset-4',
        )}
      />
    </div>
  );
};


export const NodeDisplayText = ({children}: NodeDisplayTextProps) => (

    <div className="flex-1 text-sm p-1 min-h-0 overflow-y-auto nowheel select-text nodrag cursor-text">
      {children?.split('\n').map((line, i) => (
        <span key={i} className="block mb-2">{line || '\u00A0'}</span>
      ))}
    </div>
)


export const NodeDisplayMarkdown = ({content}: {content: string}) => (
  <div
    className="prose prose-sm nodrag select-text cursor-text"
    dangerouslySetInnerHTML={{
      __html: DOMPurify.sanitize(marked.parse(content) as string)
    }}
  />
)


export const NodeDisplayThinking = (

) => (

  <div className="flex-1 p-5 flex items-center justify-center">
    <span className="text-sm! text-muted-foreground animate-pulse">thinking...</span>
  </div>
)


export const DisplayUserMessage = ({message}: { message?: string }) => (
  <div className="chat chat-end nodrag select-text cursor-text">
    <div className="chat-bubble text-sm">{message}</div>
  </div>
)
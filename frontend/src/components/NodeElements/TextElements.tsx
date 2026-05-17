import {Textarea} from "@/components/ui/textarea.tsx";
import {cn} from "@/lib/utils.ts";
import React, {useState} from "react";
import {useDebouncedCallback} from "use-debounce";
import useStore from "@/store.ts";
import DOMPurify from 'dompurify';
import {marked} from '@/lib/markdown.ts';

import 'highlight.js/styles/github-dark.css'
import {Play} from "lucide-react";

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
          'nodrag min-h-16 w-123 max-h-50 resize-none bg-black/5 border-[lightgray] rounded-sm mx-2 border p-2 text-sm/5! text-black nowheel',
          'transition-all focus:ring ring-0! outline-none',
        )}
      >
        <div>
          <Play></Play>
        </div>
      </Textarea>

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


export const NodeDisplayMarkdown = ({content, className}: { content: string, className?: string }) => (
  <div
    className={cn(
      "prose prose-sm nodrag select-text cursor-text",
      className,
    )}
    dangerouslySetInnerHTML={{
      __html: DOMPurify.sanitize(marked.parse(content) as string)
    }}
  />
)


export const NodeDisplayPulsingText = (
  {children}: { children?: React.ReactNode }
) => (

  <div className="flex-1 p-5 flex items-center justify-center">
    <span className="text-sm! text-muted-foreground animate-pulse">
      {children}
    </span>
  </div>
)

type ChatBubblePosition = "left" | "right"

const ChatBubblePositions: Record<ChatBubblePosition, string> = {
  left: "chat-start",
  right: "chat-end",
};

export const ChatBubble = (
  {
    children,
    position,
    maxHeight = true
  }:
  {
    children?: React.ReactNode,
    position: ChatBubblePosition,
    maxHeight?: boolean
  }) => (
  <div className={cn(
    "chat nodrag select-text cursor-text",
    ChatBubblePositions[position]
  )}>

    <div className="chat-bubble text-sm wrap-break-word">
      <div className={cn(
        "overflow-y-auto overflow-x-hidden",
        maxHeight ? "max-h-15" : "",
      )}>
        {children}
      </div>
    </div>

  </div>
)
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
  dataKey: string
}

export const NodeTextarea = ({id, initialValue, placeholder, dataKey}: NodeTextareaProps) => {

  const [localText, setLocalText] = useState(initialValue || "");
  const updateNodeData = useStore((s) => s.updateNodeData);

  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateNodeData(id, {[dataKey]: value});
  }, 500);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    debouncedUpdate(e.target.value);
  };

  return (
    <textarea
      value={localText}
      onChange={handleTextChange}
      placeholder={placeholder}
      className="textarea textarea-md nodrag nowheel min-h-16 w-auto resize-none bg-neutral-100 rounded-md outline-none"
    />
  );
};


export const NodeDisplayMarkdown = ({content, className}: { content: string, className?: string }) => {
  const toMarkdownNewlines = (text: string) => text.replace(/\n/g, '  \n');

  return (
    <div
      className={cn("prose prose-sm nodrag select-text cursor-text", className)}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked.parse(toMarkdownNewlines(content)) as string)
      }}
    />
  )
}

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
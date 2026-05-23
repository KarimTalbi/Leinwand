import {cn} from "@/lib/utils.ts";

import DOMPurify from 'dompurify';
import {marked} from '@/lib/markdown.ts';

import 'highlight.js/styles/github-dark.css'


export const NodeDisplayMarkdown = ({content, className}: { content?: string, className?: string }) => {
  const toMarkdownNewlines = (text: string) => text.replace(/\n/g, '  \n');

  return (
    <div
      className={cn("prose prose-sm nodrag select-text cursor-text", className)}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked.parse(toMarkdownNewlines(content || "")) as string)
      }}
    />
  )
}
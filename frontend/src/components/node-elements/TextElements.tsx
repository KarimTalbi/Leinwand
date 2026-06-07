import DOMPurify from 'dompurify'
import 'highlight.js/styles/github-dark-dimmed.css'
import {marked} from '@/lib/markdown'
import {cn} from '@/lib/utils'
import React from "react";

export const NodeDisplayMarkdown = ({content, className}: { content?: string, className?: string }) => {
  const toMarkdownNewlines = (text: string) => text.replace(/\n/g, '  \n')

const isCopyingRef = React.useRef(false)

const handleCopy = (e: React.ClipboardEvent) => {
  if (isCopyingRef.current) return
  e.preventDefault()

  const html = DOMPurify.sanitize(marked.parse(toMarkdownNewlines(content || '')) as string)

  if (navigator.clipboard) {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([content || ''], { type: 'text/plain' }),
      })
    ]).catch(() => navigator.clipboard.writeText(content || ''))
  } else {
    isCopyingRef.current = true
    document.execCommand('copy')
    isCopyingRef.current = false
  }
}

  return (
    <div
      className={cn('prose nodrag nopan select-text cursor-text px-2', className)}
      onCopy={handleCopy}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked.parse(toMarkdownNewlines(content || '')) as string),
      }}
    />
  )
}
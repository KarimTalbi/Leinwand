import DOMPurify from 'dompurify'
import 'highlight.js/styles/github-dark.css'
import {marked} from '@/lib/markdown'
import {cn} from '@/lib/utils'


/**
 * Renders a string as sanitized Markdown content.
 * This component takes a string, converts newlines to Markdown-compatible newlines,
 * parses it using 'marked', and sanitizes the output with DOMPurify to prevent XSS attacks.
 * It's designed for displaying text content within a node.
 *
 * @param props - Component properties.
 * @param props.content - The string content to be rendered as Markdown.
 * @param props.className - Optional additional CSS classes to apply to the container.
 * @returns A div element with the rendered and sanitized Markdown content.
 */
export const NodeDisplayMarkdown = ({content, className}: { content?: string, className?: string }) => {
  const toMarkdownNewlines = (text: string) => text.replace(/\n/g, '  \n')

  return (
    <div
      className={cn('prose prose-sm text-sm nodrag select-text cursor-text', className)}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked.parse(toMarkdownNewlines(content || '')) as string),
      }}
    />
  )
}

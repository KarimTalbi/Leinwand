import DOMPurify from 'dompurify'
import 'highlight.js/styles/github-dark-dimmed.css'
import {marked} from '@/lib/markdown'
import {cn} from '@/lib/utils'

export const NodeDisplayMarkdown = ({content, className}: { content?: string, className?: string }) => {
  const toMarkdownNewlines = (text: string) => text.replace(/\n/g, '  \n')

  return (
    <div
      className={cn('prose nodrag select-text cursor-text', className)}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked.parse(toMarkdownNewlines(content || '')) as string),
      }}
    />
  )
}

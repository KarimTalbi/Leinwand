import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

const NodeMarkdown = ({children}: { children?: string }) => {
  return (
    <div
      className="flex-1 text-black p-3 rounded-xl min-h-0 overflow-y-auto nowheel">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 className="text-lg font-bold mb-3">{children}</h1>,
          h2: ({children}) => <h2 className="text-base font-bold mb-3">{children}</h2>,
          h3: ({children}) => <h3 className="text-xs font-bold mb-3">{children}</h3>,
          p: ({children}) => <p className="text-xs mb-3 whitespace-pre-wrap">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1">{children}</ol>,
          li: ({children}) => <li className="text-xs [&>p]:inline mb-3">{children}</li>,
          hr: () => <hr className="my-4 border-t border-gray-300"/>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export default NodeMarkdown;


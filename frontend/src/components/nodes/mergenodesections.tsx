interface MergeNodeSummaryProps {
  totalStreams: number;
  totalNodes: number;
}

interface MergeNodeStreamProps {
  streamId: string;
  totalNodes: number;
}

interface PromptNodeProps {
  depth: number;
  prompt: string;
  response: string;
}

interface TextNodeProps {
  depth: number;
  text: string;
}

interface MergeNodeProps {
  depth: number;
}

const MergeContent = ({sections}: {sections: string[]}) => {
  if (!sections || sections.length === 0) return null;

  const summarySection = ({totalStreams, totalNodes}: MergeNodeSummaryProps) => (
    <div className="bg-white px-2 my-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg">Total Streams:</div>
        <div className="text-lg font-bold">{totalStreams}</div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-lg">Total Nodes:</div>
        <div className="text-lg font-bold">{totalNodes}</div>
      </div>
    </div>
  );

  const streamSection = ({streamId, totalNodes}: MergeNodeStreamProps) => {
    return (
      <div className="bg-white pt-4 px-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center justify-between gap-1">

            <div className="text-base">Stream:</div>
            <div className="text-base font-bold">{streamId}</div>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="text-base">Nodes:</div>
            <div className="text-base font-bold">{totalNodes}</div>
          </div>

        </div>
      </div>
    );
  };

  const promptSection = ({depth, prompt, response}: PromptNodeProps) => {
    return (
      <div className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">

        <div className="flex items-center justify-between">

          <div className="flex items-center justify-between gap-3">

            <div className="text-xs">DEPTH:</div>
            <div className="text-xs font-bold">{depth}</div>
          </div>
          <div className="text-xs mb-2">PROMPT NODE</div>

        </div>

        <div className="my-4 h-px mx-2 bg-black/10"/>

        <div className="text-base font-bold">User</div>
        <div className="text-xs">{prompt}</div>

        <div className="my-4 h-px mx-2 bg-black/10"/>

        <div className="text-base font-bold">AI</div>
        <div className="text-xs">{response}</div>

      </div>

    );
  };

  const textSection = ({depth, text}: TextNodeProps) => {
    return (
      <div className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">

        <div className="flex items-center justify-between">

          <div className="flex items-center justify-between gap-3">

            <div className="text-xs">BRANCH / DEPTH:</div>
            <div className="text-xs font-bold">{depth}</div>
          </div>
          <div className="text-xs">TEXT NODE</div>

        </div>

        <div className="my-4 h-px mx-2 bg-black/10"/>

        <div className="text-xs">{text}</div>

      </div>

    );
  };

  const mergeSection = ({depth}: MergeNodeProps) => {
    return (
      <div className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">

        <div className="flex items-center justify-between">

          <div className="flex items-center justify-between gap-3">

            <div className="text-xs">BRANCH / DEPTH:</div>
            <div className="text-xs font-bold">{depth}</div>
          </div>
          <div className="text-xs">MERGE NODE</div>

        </div>

      </div>
    )
  };

  const buildSectionByType = (section: any) => {

    switch (section.type) {
      case 'global_summary':
        return summarySection({totalStreams: section.total_streams, totalNodes: section.total_nodes});

      case 'stream_summary':
        return streamSection({streamId: section.stream_id, totalNodes: section.total_nodes});

      case 'promptNode':
        return promptSection({depth: section.depth, prompt: section.prompt, response: section.response});

      case 'textNode':
        return textSection({depth: section.depth, text: section.text});

      case 'mergeNode':
        return mergeSection({depth: section.depth});

      default:
        console.error('Unknown section type:', section);
        break;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-2 rounded-t-2xl p-2">
      <div className="flex-1 w-full text-black p-2 py-0 rounded-xl min-h-16 overflow-y-auto nowheel">

        {sections.map((section: any) => (

          <div key={section.id ?? section.type}>
            {buildSectionByType(section)}
          </div>

        ))}

      </div>
    </div>
  )
};

export default MergeContent;








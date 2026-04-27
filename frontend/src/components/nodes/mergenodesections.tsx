interface PromptNodeProps {
  stream_id: number;
  depth: number;
  prompt: string;
  response: string;
}

interface TextNodeProps {
  stream_id: number;
  depth: number;
  text: string;
}

interface MergeNodeProps {
  stream_id: number;
  depth: number;
}

interface ProblemProps {
  ai: string;
  user: string;
  solution: string;
}

const MergeContent = ({sections}: { sections: string[] }) => {

  if (!sections || sections.length === 0) return null;


  const problemSection = ({ai, user, solution}: ProblemProps) => {

    return (

      <div className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base">PROBLEM</div>
          </div>
          <div className="text-xs mb-2">PROBLEM RESOLUTION</div>
        </div>
        <div className="my-4 h-px mx-2 bg-black/10"/>
        <div className="text-base font-bold">AI</div>
        <div className="text-base">{ai}</div>

        <div className="my-4 h-px mx-2 bg-black/10"/>
        <div className="text-base font-bold">User</div>
        <div className="text-base">{user}</div>

        <div className="my-4 h-px mx-2 bg-black/10"/>
        <div className="text-base font-bold">Solution</div>
        <div className="text-base">{solution}</div>
      </div>

    )
  }

  const promptSection = ({stream_id, depth, prompt, response}: PromptNodeProps) => {
    return (
      <div className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">

        <div className="flex items-center justify-between">

          <div className="flex items-center justify-between gap-3">

            <div className="text-base">BRANCH / DEPTH:</div>
            <div className="text-base font-bold">{stream_id} / {depth}</div>
          </div>

          <div className="text-xs mb-2">PROMPT NODE</div>

        </div>

        <div className="my-4 h-px mx-2 bg-black/10"/>

        <div className="text-base font-bold">User</div>
        <div className="text-base">{prompt}</div>

        <div className="my-4 h-px mx-2 bg-black/10"/>

        <div className="text-base font-bold">AI</div>
        <div className="text-base">{response}</div>

      </div>

    );
  };

  const textSection = ({stream_id, depth, text}: TextNodeProps) => {
    return (
      <div className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">

        <div className="flex items-center justify-between">

          <div className="flex items-center justify-between gap-3">

            <div className="text-base">BRANCH / DEPTH:</div>
            <div className="text-base font-bold">{stream_id} / {depth}</div>
          </div>
          <div className="text-xs">TEXT NODE</div>

        </div>

        <div className="my-4 h-px mx-2 bg-black/10"/>

        <div className="text-base">{text}</div>

      </div>

    );
  };

  const mergeSection = ({stream_id, depth}: MergeNodeProps) => {
    return (
      <div className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">

        <div className="flex items-center justify-between">

          <div className="flex items-center justify-between gap-3">

            <div className="text-base">BRANCH / DEPTH:</div>
            <div className="text-base font-bold">{stream_id}{depth}</div>
          </div>
          <div className="text-xs">MERGE NODE</div>

        </div>

      </div>
    )
  };

  const buildSectionByType = (section: any) => {

    switch (section.type) {
      case 'promptNode':
        return promptSection({stream_id: section.stream_id, depth: section.depth, prompt: section.prompt, response: section.response});

      case 'textNode':
        return textSection({stream_id: section.stream_id, depth: section.depth, text: section.text});

      case 'mergeNode':
        return mergeSection({stream_id: section.stream_id, depth: section.depth});

      case 'problemResolution':
        return problemSection({ai: section.ai, user: section.user, solution: section.solution});

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








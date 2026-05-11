import React from "react";

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

interface SummaryNodeProps {
  stream_id: number;
  depth: number;
  response: string;
}

interface ProblemProps {
  ai: string;
  user: string;
  solution: string;
}

const Section = ({children}: { children: React.ReactNode }) => (
  <div className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">
    {children}
  </div>
)

const SectionHeader = ({stream_id, depth, type}: { stream_id: number, depth: number, type: string }) => (
  <div className="flex items-center justify-between">

    <div className="flex items-center justify-between gap-3">
      <p className="text-base">BRANCH / DEPTH:</p>
      <p className="text-base font-bold">{stream_id} / {depth}</p>
    </div>

    <p className="text-xs mb-2">{type}</p>

  </div>
)

const SectionSeparator = () => (
  <div className="my-4 h-px mx-2 bg-black/10"/>
)

const SectionText = ({text}: { text: string }) => (
  <p className="text-base">{text}</p>
)

const SectionLabel = ({label}: { label: string }) => (
  <p className="text-base font-bold">{label}</p>
)

const MergeContent = ({sections}: { sections: string[] }) => {

  if (!sections || sections.length === 0) return null;

  const textSection = ({stream_id, depth, text}: TextNodeProps) => (
    <Section>
      <SectionHeader stream_id={stream_id} depth={depth} type="TEXT NODE"/>
      <SectionSeparator/>
      <SectionText text={text}/>
    </Section>
  );


  const promptSection = ({stream_id, depth, prompt, response}: PromptNodeProps) => (
    <Section>
      <SectionHeader stream_id={stream_id} depth={depth} type="PROMPT NODE"/>
      <SectionSeparator/>
      <SectionLabel label="User"/>
      <SectionText text={prompt}/>
      <SectionSeparator/>
      <SectionLabel label="AI"/>
      <SectionText text={response}/>
    </Section>
  );


  const mergeSection = ({stream_id, depth}: MergeNodeProps) => (
    <Section>
      <SectionHeader stream_id={stream_id} depth={depth} type="MERGE NODE"/>
    </Section>
  );

  const summarySection = ({stream_id, depth, response} : SummaryNodeProps) => (
    <Section>
      <SectionHeader stream_id={stream_id} depth={depth} type="SUMMARY NODE"/>
      <SectionSeparator/>
      <SectionText text={response}/>
    </Section>
  )

  const problemSection = ({ai, user, solution}: ProblemProps) => (
    <Section>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base">PROBLEM</p>
        </div>
        <div className="text-xs mb-2">PROBLEM RESOLUTION</div>
      </div>
      <SectionSeparator/>
      <SectionLabel label="AI"/>
      <SectionText text={ai}/>
      <SectionSeparator/>
      <SectionLabel label="User"/>
      <SectionText text={user}/>
      <SectionSeparator/>
      <SectionLabel label="Solution"/>
      <SectionText text={solution}/>
    </Section>
  )

  const buildSectionByType = (section: any) => {

    switch (section.type) {
      case 'promptNode':
        return promptSection({
          stream_id: section.stream_id,
          depth: section.depth,
          prompt: section.prompt,
          response: section.response
        });

      case 'textNode':
        return textSection({stream_id: section.stream_id, depth: section.depth, text: section.text});

      case 'mergeNode':
        return mergeSection({stream_id: section.stream_id, depth: section.depth});

      case 'problemResolution':
        return problemSection({ai: section.ai, user: section.user, solution: section.solution});

      case 'summaryNode':
        return summarySection({stream_id: section.stream_id, depth: section.depth, response: section.response});

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
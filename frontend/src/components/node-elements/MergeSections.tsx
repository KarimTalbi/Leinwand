import {useState} from 'react'
import {NodeDisplayMarkdown} from '@/components/node-elements/TextElements'
import {ChevronDown, ChevronUp, ExternalLink, LucideCircleAlert, LucideIcon,} from 'lucide-react'
import {typeProps} from '@/lib/styles'
import {Section} from '@/types'


/**
 * Properties for the MergeContent component.
 */
interface MergeContentProps {
  /** Array of section objects representing different parts of a merged conversation. */
  sections: Section[]
  /** Optional callback triggered when a user clicks to navigate to a specific node. */
  onGoToNode?: (nodeId: string) => void
}

const TYPE_META: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  ...typeProps, problemResolution: {label: 'ISSUE', color: '#ef4444', icon: LucideCircleAlert},
}

/**
 * Renders the content of a specific section based on its type.
 *
 * @param props - Component properties.
 * @param props.section - The section data to render.
 * @returns The appropriate UI for the section type, or null if unknown.
 */
const SectionContent = ({section}: { section: Section }) => {

  switch (section.type) {

    case 'promptNode':
      return (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold opacity-60">User</p>
          <NodeDisplayMarkdown content={section.prompt ?? ''}/>
          <p className="text-xs font-bold opacity-60 mt-1">AI</p>
          <NodeDisplayMarkdown content={section.response ?? ''}/>
        </div>
      )

    case 'textNode':
      return <NodeDisplayMarkdown content={section.text ?? ''}/>

    case 'summaryNode':
      return <NodeDisplayMarkdown content={section.response ?? ''}/>

    case 'problemResolution':
      return (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold opacity-60">Problem</p>
          <NodeDisplayMarkdown content={section.problems ?? ''}/>
          <p className="text-xs font-bold opacity-60 mt-1">Solution</p>
          <NodeDisplayMarkdown content={section.solution ?? ''}/>
        </div>
      )

    case 'mergeNode':
      return <p className="text-xs opacity-50 italic">Merge node — no content.</p>

    default:
      return null
  }
}

/**
 * Displays an expandable card for a section, showing metadata and an option
 * to view the full content or jump to the original node.
 *
 * @param props - Component properties.
 * @param props.section - The section data to display.
 * @param props.onGoToNode - Optional callback for navigating to the node.
 * @returns A collapsible card representing the section.
 */
const SectionCard = ({section, onGoToNode,}: {
  section: Section
  onGoToNode?: (id: string) => void
}) => {
  const [open, setOpen] = useState(false)
  const meta = TYPE_META[section.type] ?? {label: section.type, badge: 'badge-ghost'}

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 mb-1 text-xs overflow-hidden w-full">
      <div className="flex items-center justify-between px-2 py-1 gap-1">

        <button
          className="flex items-center gap-1 flex-1 text-left nodrag"
          onClick={() => setOpen((v) => !v)}
        >

          <span
            className="badge"
            style={{color: meta.color}}
          >
            <meta.icon size={10}/>
            {meta.label}
          </span>

          {open ? <ChevronUp size={10} className="ml-auto opacity-40"/> :
            <ChevronDown size={10} className="ml-auto opacity-40"/>}
        </button>

        <button
          className="btn btn-ghost btn-xs px-1 nodrag"
          onClick={() => onGoToNode?.(section.id)}
          title="Go to node"
        >
          <ExternalLink size={10}/>
        </button>

      </div>

      {open && (
        <div className="px-2 pb-2 pt-1 border-t border-base-300 max-h-40 overflow-y-auto nowheel">
          <SectionContent section={section}/>
        </div>
      )}
    </div>
  )
}

/**
 * Displays a column of sections, representing a branch in a merged flow.
 *
 * @param props - Component properties.
 * @param props.label - The title for the column.
 * @param props.sections - An array of sections belonging to this branch.
 * @param props.onGoToNode - Optional callback for navigating to a node.
 * @returns A column of section cards.
 */
const BranchColumn = ({label, sections, onGoToNode}: {
  label: string
  sections: Section[]
  onGoToNode?: (id: string) => void
}) => (

  <div className="flex flex-col flex-1 min-w-0">
    <p className="text-xs font-bold opacity-40 mb-1 px-0.5">{label}</p>
    <div className="flex flex-col overflow-y-auto nowheel max-h-64">

      {sections.length === 0
        ? <p className="text-xs opacity-30 italic px-0.5">No nodes</p>
        : sections.map((s) => (
          <SectionCard key={s.id} section={s} onGoToNode={onGoToNode}/>
        ))
      }

    </div>
  </div>
)


/**
 * Main component for rendering the content of a Merge Node.
 * It visualizes two branches of conversation that are being merged, side-by-side,
 * and highlights any contradictions or problems found between them.
 *
 * @param props - Component properties.
 * @param props.sections - The array of sections constituting the merge inputs.
 * @param props.onGoToNode - Optional callback for navigating to a source node.
 * @returns The UI for comparing branches and displaying merge resolutions.
 */
const MergeContent = ({sections, onGoToNode}: MergeContentProps) => {
  if (!sections || sections.length === 0) return null

  const problem = sections.find((s) => s.id === 'problem')
  const streamSections = sections.filter((s) => s.id !== 'problem')

  const streamIds = [...new Set(streamSections.map((s) => s.stream_id))].sort()
  const branch1 = streamSections.filter((s) => s.stream_id === streamIds[0])
  const branch2 = streamSections.filter((s) => s.stream_id === streamIds[1])

  return (
    <div className="flex flex-col px-2 py-2 gap-2">
      <div className="flex gap-2">
        <BranchColumn label="Branch 1" sections={branch1} onGoToNode={onGoToNode}/>
        <div className="w-px bg-base-300 shrink-0"/>
        <BranchColumn label="Branch 2" sections={branch2} onGoToNode={onGoToNode}/>
      </div>

      {problem && (
        <div className="flex flex-col">
          <div className="w-full h-px bg-base-300 mb-2"/>
          <p className="text-xs font-bold opacity-40 mb-1 px-0.5 text-center">Contradiction</p>
          <SectionCard section={problem} onGoToNode={undefined}/>
        </div>
      )}
    </div>
  )
}

export default MergeContent

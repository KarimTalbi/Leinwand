import {useStoreWithId} from '@/hooks/useStoreWithId'
import {addConnectedButtonStyle, typeProps} from '@/lib/styles'

/**
 * A component that renders a row of buttons to add a new node connected
 * to the current node. This component is typically attached to the bottom
 * of a node.
 *
 * @param props - Component properties.
 * @param props.sourceId - The ID of the node from which the new node will be connected.
 * @returns The component containing buttons to add different types of connected nodes.
 */
const AddConnectedNode = ({sourceId}: {sourceId: string}) => {
  const {conPrompt, conText, conMerge, conSummary} = useStoreWithId(sourceId)

  return (
    <div className="translate-x-45">
      <div
        className="flex flex-row items-center justify-around bg-neutral-50 ring-1 ring-neutral-200 rounded-b-md w-25">

        <div className="tooltip tooltip-bottom" data-tip="Prompt Node">
          <button className={addConnectedButtonStyle} onClick={conPrompt}>
            <typeProps.promptNode.icon size={10} color={typeProps.promptNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Text Node">
          <button className={addConnectedButtonStyle} onClick={conText}>
            <typeProps.textNode.icon size={10} color={typeProps.textNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Summary Node">
          <button className={addConnectedButtonStyle} onClick={conSummary}>
            <typeProps.summaryNode.icon size={10} color={typeProps.summaryNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Merge Node">
          <button className={addConnectedButtonStyle} onClick={conMerge}>
            <typeProps.mergeNode.icon size={10} color={typeProps.mergeNode.color}/>
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddConnectedNode

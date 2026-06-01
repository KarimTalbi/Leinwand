import {useStoreWithId} from '@/hooks/useStoreWithId'
import {background, flowButtonStyle, ring, typeProps} from '@/lib/styles'
import {cn} from "@/lib/utils.ts";

const AddConnectedNode = ({sourceId}: { sourceId: string }) => {
  const {conPrompt, conText, conMerge, conSummary} = useStoreWithId(sourceId)

  return (
    <div className="translate-x-50">
      <div
        className={cn("flex flex-row items-center justify-around shadow-md rounded-b-2xl w-30 p-1", background, ring)}>

        <div className="tooltip tooltip-bottom" data-tip="Prompt Node">
          <button className={cn(flowButtonStyle, "btn-xs")} onClick={conPrompt}>
            <typeProps.promptNode.icon size={12} color={typeProps.promptNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Text Node">
          <button className={cn(flowButtonStyle, "btn-xs")} onClick={conText}>
            <typeProps.textNode.icon size={12} color={typeProps.textNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Summary Node">
          <button className={cn(flowButtonStyle, "btn-xs")} onClick={conSummary}>
            <typeProps.summaryNode.icon size={12} color={typeProps.summaryNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Merge Node">
          <button className={cn(flowButtonStyle, "btn-xs")} onClick={conMerge}>
            <typeProps.mergeNode.icon size={12} color={typeProps.mergeNode.color}/>
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddConnectedNode

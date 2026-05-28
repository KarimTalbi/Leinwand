import {typeProps} from "@/lib/styles.ts";
import {useStoreWithId} from "@/hooks/useStoreWithId.ts";


const AddConnectedNode = ({sourceId}: { sourceId: string }) => {
  const {conPrompt, conText, conMerge, conSummary} = useStoreWithId(sourceId)

  return (
    <div className="translate-x-45">
      <div
        className="flex flex-row items-center justify-around bg-neutral-50 ring-1 ring-neutral-200 rounded-b-md w-25">

        <div className="tooltip tooltip-bottom" data-tip="Prompt Node">
          <button className="btn btn-ghost btn-square btn-xs" onClick={conPrompt}>
            <typeProps.promptNode.icon size={10} color={typeProps.promptNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Text Node">
          <button className="btn btn-ghost btn-square btn-xs" onClick={conText}>
            <typeProps.textNode.icon size={10} color={typeProps.textNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Summary Node">
          <button className="btn btn-ghost btn-square btn-xs" onClick={conSummary}>
            <typeProps.summaryNode.icon size={10} color={typeProps.summaryNode.color}/>
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Merge Node">
          <button className="btn btn-ghost btn-square btn-xs" onClick={conMerge}>
            <typeProps.mergeNode.icon size={10} color={typeProps.mergeNode.color}/>
          </button>
        </div>

      </div>
    </div>
  )
};

export default AddConnectedNode;
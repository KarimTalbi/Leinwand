import {Panel} from '@xyflow/react'
import {
  LucideLock,
  LucideMouseOff,
  LucideMouse,
  LockOpen,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import useStore from "@/store.ts";
import {typeProps} from "@/lib/styles.ts";
import {useShallow} from "zustand/react/shallow";
import {AppState} from "@/types.ts";
import {usePan} from "@/hooks/usePan.ts";
import {useCreateNode} from "@/hooks/useCreateNode.ts";

const controlButtonStyle = "btn btn-ghost btn-square btn-sm"

const selector = (state: AppState) => ({
  locked: state.locked,
  setLocked: state.setLocked,
  scrollToZoom: state.scrollToZoom,
  setScrollToZoom: state.setScrollToZoom,
})

export const Controls = () => {
  const {locked, setLocked, scrollToZoom, setScrollToZoom} = useStore(useShallow(selector))
  const {panUp, panDown, panLeft, panRight, zoomOut, zoomIn} = usePan();
  const {createPromptNode, createSummaryNode, createTextNode, createMergeNode} = useCreateNode()

  return (
    <Panel position="bottom-center" className="flex flex-row shrink-0 gap-2" style={{zIndex: 1000}}>

      <div
        className="flex flex-row gap-1 items-center justify-center text-neutral-500 bg-neutral-50 ring-1 ring-neutral-200 rounded-full px-3 py-1.5">

        <div className="tooltip" data-tip="Toggle Canvas Lock">
          <button className={controlButtonStyle} onClick={setLocked}>
            {locked ? <LockOpen size={14}/> : <LucideLock size={14}/>}
          </button>
        </div>

        <div className="tooltip" data-tip="Toggle Scroll to Zoom">
          <button className={controlButtonStyle} onClick={setScrollToZoom}>
            {scrollToZoom ? <LucideMouseOff size={14}/> : <LucideMouse size={14}/>}
          </button>
        </div>

        <div className="divider divider-horizontal m-0 my-2"/>

        <div className="tooltip" data-tip="Zoom In">
          <button className={controlButtonStyle} onClick={zoomIn}>
            <ZoomIn size={14}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Zoom Out">
          <button className={controlButtonStyle} onClick={zoomOut}>
            <ZoomOut size={14}/>
          </button>
        </div>

        <div className="divider divider-horizontal m-0 my-2"/>

        <div className="tooltip" data-tip="Pan Up">
          <button className={controlButtonStyle} onClick={panUp}>
            <ArrowUp size={14}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Pan Down">
          <button className={controlButtonStyle} onClick={panDown}>
            <ArrowDown size={14}/>
          </button>
        </div>

        <div className="divider divider-horizontal m-0 my-2"/>

        <div className="tooltip" data-tip="Pan Left">
          <button className={controlButtonStyle} onClick={panLeft}>
            <ArrowLeft size={14}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Pan Right">
          <button className={controlButtonStyle} onClick={panRight}>
            <ArrowRight size={14}/>
          </button>
        </div>
      </div>

      <div
        className="flex flex-row gap-1 items-center justify-center text-neutral-500 bg-neutral-50 ring-1 ring-neutral-200 rounded-full px-3 py-1.5">

        <div className="tooltip" data-tip="Add Chat Node">
          <button className={controlButtonStyle} onClick={createPromptNode}>
            <typeProps.promptNode.icon color={typeProps.promptNode.color} size={14}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Add Text Node">
          <button className={controlButtonStyle} onClick={createTextNode}>
            <typeProps.textNode.icon color={typeProps.textNode.color} size={14}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Add Summary Node">
          <button className={controlButtonStyle} onClick={createSummaryNode}>
            <typeProps.summaryNode.icon color={typeProps.summaryNode.color} size={14}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Add Merge Node">
          <button className={controlButtonStyle} onClick={createMergeNode}>
            <typeProps.mergeNode.icon color={typeProps.mergeNode.color} size={14}/>
          </button>
        </div>

      </div>

    </Panel>
  )
}
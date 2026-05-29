import {Panel} from '@xyflow/react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Lock,
  LockOpen,
  Mouse,
  MouseOff,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {useShallow} from 'zustand/react/shallow'
import {useCreateNode} from '@/hooks/useCreateNode'
import {usePan} from '@/hooks/usePan'
import {controlBarStyle, controlButtonStyle, typeProps} from '@/lib/styles'
import useStore from '@/store'
import {AppState} from '@/types'

/**
 * Zustand selector for picking state and actions from the store.
 * This selector is optimized with `useShallow` to prevent unnecessary re-renders.
 *
 * @param state - The global application state.
 * @returns An object containing the selected state and actions.
 */
const selector = (state: AppState) => ({
  locked: state.locked,
  setLocked: state.setLocked,
  scrollToZoom: state.scrollToZoom,
  setScrollToZoom: state.setScrollToZoom,
})


/**
 * Renders a control bar at the bottom of the canvas.
 * This component provides UI controls for canvas interaction, such as panning, zooming,
 * locking the canvas, and toggling scroll-to-zoom behavior. It also includes
 * buttons for creating different types of nodes on the canvas.
 *
 * @returns The control bar component.
 */
export const Controls = () => {
  const {locked, setLocked, scrollToZoom, setScrollToZoom} = useStore(useShallow(selector))
  const {panUp, panDown, panLeft, panRight, zoomOut, zoomIn} = usePan()
  const {createPromptNode, createSummaryNode, createTextNode, createMergeNode} = useCreateNode()

  const LockIcon = locked ? LockOpen : Lock
  const ScrollIcon = scrollToZoom ? MouseOff : Mouse

  return (
    <Panel position="bottom-center" className="flex flex-row shrink-0 gap-2" style={{zIndex: 1000}}>

      <div className={controlBarStyle}>

        <div className="tooltip" data-tip="Toggle Canvas Lock">
          <button className={controlButtonStyle} onClick={setLocked}>
            <LockIcon size={14}/>
          </button>
        </div>

        <div className="tooltip" data-tip="Toggle Scroll to Zoom">
          <button className={controlButtonStyle} onClick={setScrollToZoom}>
            <ScrollIcon size={14}/>
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

      <div className={controlBarStyle}>

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

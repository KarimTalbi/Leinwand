import {AppState} from "@/types.ts";
import {Panel, useReactFlow} from "@xyflow/react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {ChevronLeft, Lock, LockOpen, LucideScan, ZoomInIcon, ZoomOutIcon} from "lucide-react";
import AddNodeMenu from "../Buttons/AddNodeMenu.tsx";
import CircleIconButton from "../Buttons/CircleButton.tsx";

const selector = (state: AppState) => ({
  syncing: state.syncing,
  locked: state.locked,
  setLocked: state.setLocked,
  exitCanvas: state.exitCanvas,
});


const NavigationOverlay = () => {
  const {zoomIn, zoomOut, zoomTo} = useReactFlow()
  const {locked, setLocked, exitCanvas} = useStore(useShallow(selector));


  return (
    <div>
      <Panel position="bottom-center" className="flex flex-row items-center justify-between gap-18">


        <div className="flex flex-row items-center justify-between bg-white rounded-full shadow-md mb-4">


          <CircleIconButton onClick={() => zoomIn()} title="Zoom In">
            <ZoomInIcon/>
          </CircleIconButton>

          <CircleIconButton onClick={() => zoomOut()} title="Zoom Out">
            <ZoomOutIcon/>
          </CircleIconButton>

          <CircleIconButton onClick={() => zoomTo(1)} title="Reset Zoom">
            <LucideScan/>
          </CircleIconButton>

          <CircleIconButton onClick={() => setLocked(!locked)} title="Lock Canvas">
            {locked ? <LockOpen/> : <Lock/>}
          </CircleIconButton>


        </div>
        <div>

          <AddNodeMenu/>

        </div>


      </Panel>


      <Panel position="top-right" className="flex flex-row items-center justify-between gap-4">


        <div
          className="flex flex-row items-center justify-between mb-3 bg-white/50 rounded-full shadow-md backdrop-blur-sm">

          <CircleIconButton onClick={exitCanvas} title="Exit" tooltipPosition="bottom">
            <ChevronLeft/>
          </CircleIconButton>

        </div>

      </Panel>
    </div>
  )
};

export default NavigationOverlay;
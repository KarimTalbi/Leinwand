import {AppState} from "@/types.ts";
import {Panel} from "@xyflow/react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {ChevronLeft, Settings2} from "lucide-react";
import CircleIconButton from "../Buttons/CircleButton.tsx";

const selector = (state: AppState) => ({
  syncing: state.syncing,
  locked: state.locked,
  setLocked: state.setLocked,
  exitCanvas: state.exitCanvas,
});


const NavigationOverlay = () => {
  const {exitCanvas} = useStore(useShallow(selector));


  return (
    <div>

      <Panel position="top-right" className="flex flex-row items-center justify-between gap-4">

        <div
          className="flex flex-row items-center justify-between mb-3 bg-white/50 rounded-full shadow-md backdrop-blur-sm">



          <CircleIconButton onClick={exitCanvas} title="Exit" tooltipPosition="bottom">
            <ChevronLeft/>
          </CircleIconButton>

          <CircleIconButton onClick={() => null} title="Settings" tooltipPosition="bottom">
            <Settings2/>
          </CircleIconButton>

        </div>

      </Panel>
    </div>
  )
};

export default NavigationOverlay;
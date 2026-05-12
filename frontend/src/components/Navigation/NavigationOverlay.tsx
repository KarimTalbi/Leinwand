import {AppState} from "@/types.ts";
import {Panel} from "@xyflow/react";
import useStore from "@/store.ts";
import {useShallow} from "zustand/react/shallow";
import {ChevronLeft, Settings2} from "lucide-react";
import CustomButton from "../Buttons/CircleButton.tsx";
import {AddNodeButton} from "@/components/Buttons/AddNodeButton.tsx";

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

      <Panel position="bottom-right" className="flex flex-row items-center justify-between">
        <div
          className="flex flex-row items-center justify-between bg-white rounded-full border-2 border-gray-500">
        <AddNodeButton></AddNodeButton>
        </div>
      </Panel>


      <Panel position="top-right" className="flex flex-row items-center justify-between gap-4">

        <div
          className="flex flex-row items-center justify-between bg-white rounded-full border-2 border-gray-500 mt-20">



          <CustomButton onClick={exitCanvas} title="Exit" tooltipPosition="bottom">
            <ChevronLeft/>
          </CustomButton>

          <CustomButton onClick={() => null} title="Settings" tooltipPosition="bottom">
            <Settings2/>
          </CustomButton>

        </div>



      </Panel>
    </div>
  )
};

export default NavigationOverlay;
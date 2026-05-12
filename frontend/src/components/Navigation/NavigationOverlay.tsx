import {Panel} from "@xyflow/react";
import {AddNodeButton} from "@/components/Buttons/AddNodeButton.tsx";


const NavigationOverlay = () => {


  return (
      <Panel position="bottom-right" className="flex flex-row items-center justify-between">
        <AddNodeButton size="xl" color="secondary" style="circle" orientation={"vertical"} toolTipPosition={"left"}/>
      </Panel>
  )
};

export default NavigationOverlay;
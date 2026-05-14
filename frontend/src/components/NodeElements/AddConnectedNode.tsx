import {useNodeConnections, ViewportPortal} from "@xyflow/react";
import {AddNodeButton} from "@/components/Buttons/AddNodeButton.tsx";

interface AddConnectedNodeProps {
  nodeId: string,
  position: {x: number, y: number}
}

const AddConnectedNode = ({nodeId, position}: AddConnectedNodeProps) => {

  const connections = useNodeConnections({
    id: nodeId,
    handleType: "source",
  });

  return (
      <div
        style={{ position: 'absolute' }}
        className="translate-x-1"
      >
        <AddNodeButton size="xs" color="neutral" style="circle" orientation={"horizontalLeft"} toolTipPosition={"top"}/>

      </div>
  )
}

export default AddConnectedNode;
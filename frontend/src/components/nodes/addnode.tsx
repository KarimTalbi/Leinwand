import {useReactFlow} from "@xyflow/react";
import {useShallow} from "zustand/react/shallow";

import useStore from "@/store.ts";
import {AppState, NodeTypeNames} from "@/types.ts";

import DropdownMenu from "@/components/menus/dropdownmenu.tsx"

const selector = (state: AppState) => ({
  addNode: state.addNode,
  createConnectedNode: state.createConnectedNode,
});

const AddNodeMenu = ({sourceId, posX, posY, isOnNode}: { sourceId?: string, posX?: number, posY?: number, isOnNode: boolean }) => {
  const {screenToFlowPosition} = useReactFlow()
  const {addNode, createConnectedNode} = useStore(useShallow(selector));


  const addItem = [
    {text: "Prompt Node", onClick: () => onCreateNode('promptNode')},
    {text: "Text Node", onClick: () => onCreateNode('textNode')},
    {text: "Merge Node", onClick: () => onCreateNode('mergeNode')},
    {text: "Summary Node", onClick: () => onCreateNode('summaryNode')},
  ];


  const onCreateNode = async (type: NodeTypeNames) => {

    if (!sourceId) {

      const position = screenToFlowPosition(
        {x: window.innerWidth / 2, y: window.innerHeight / 2}
      );

      addNode(type, position);

    } else if (sourceId && posX && posY) {

      const position = {x: posX + 800, y: posY};

      createConnectedNode(type, sourceId, position);

    } else {
      console.error("Invalid sourceId or position");
    }
  };


  return (

    <DropdownMenu items={addItem} isOnNode={isOnNode}/>

  )
}

export default AddNodeMenu;
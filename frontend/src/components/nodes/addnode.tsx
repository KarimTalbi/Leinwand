import {useReactFlow} from "@xyflow/react";

import useStore from "@/store.ts";
import {NodeTypeNames} from "@/types.ts";

import DropdownMenu from "@/components/menus/dropdownmenu.tsx"


const AddNodeMenu = ({sourceId, posX, posY}: { sourceId?: string, posX?: number, posY?: number }) => {
  const {screenToFlowPosition} = useReactFlow()
  const {addNode, addEdge} = useStore();


  const addItem = [
    {text: "Prompt Node", onClick: () => onCreateNode('promptNode')},
    {text: "Text Node", onClick: () => onCreateNode('textNode')},
    {text: "Merge Node", onClick: () => onCreateNode('mergeNode')},
    {text: "Summary Node", onClick: () => onCreateNode('summaryNode')},
  ];


  const onCreateNode = async (type: NodeTypeNames,) => {

    if (!sourceId) {

      const position = screenToFlowPosition(
        {x: window.innerWidth / 2, y: window.innerHeight / 2}
      );

      void addNode(type, position);

    } else if (sourceId && posX && posY) {

      const position = {x: posX + 800, y: posY};
      const newNodeId = await addNode(type, position);

      if (newNodeId) {

        void addEdge(sourceId, newNodeId)

      }

    } else {
      console.error("Invalid sourceId or position");
    }
  };


  return (

    <DropdownMenu items={addItem}/>

  )
}

export default AddNodeMenu;
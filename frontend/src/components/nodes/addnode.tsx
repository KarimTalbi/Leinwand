import DropdownMenu from "../menus/dropdownmenu.tsx"
import {NodeTypeNames} from "@/types.ts";
import {useReactFlow} from "@xyflow/react";

import useStore from "@/store.ts";

const AddNodeMenu = () => {
  const {screenToFlowPosition} = useReactFlow()
  const {addNode} = useStore();

  const addItem = [
    {text: "Prompt Node", onClick: () => onCreateNode('promptNode')},
    {text: "Text Node", onClick: () => onCreateNode('textNode')},
    {text: "Merge Node", onClick: () => onCreateNode('mergeNode')},
    {text: "Summary Node", onClick: () => onCreateNode('summaryNode')},
  ]

  const onCreateNode = (type: NodeTypeNames) => {
    const position = screenToFlowPosition(
      {x: window.innerWidth / 2, y: window.innerHeight / 2}
    );
    void addNode(type, position);
  };
  return <DropdownMenu items={addItem}/>
}

export default AddNodeMenu;
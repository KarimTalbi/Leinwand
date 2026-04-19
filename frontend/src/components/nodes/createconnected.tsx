import useStore from "@/store.ts";
import {NodeTypeNames} from "@/types.ts";
import {Handle, Position} from "@xyflow/react";
import {Menu, MenuButton, MenuItem, MenuItems} from "@headlessui/react";
import {Plus} from "lucide-react";
import React from "react";

const ConnectionHandle = ({sourceId, posX, posY, style}: {
  sourceId: string,
  posX: number,
  posY: number,
  style?: React.CSSProperties
}) => {
  const {addNode, addEdge} = useStore();

  const onCreateNode = async (type: NodeTypeNames) => {
    const newPosition = {x: posX + 800, y: posY};
    const newNodeId = await addNode(type, newPosition);
    if (!newNodeId) return;
    await addEdge(sourceId, newNodeId)
  }

  const addItem = [
    {text: "Prompt Node", onClick: () => onCreateNode('promptNode')},
    {text: "Text Node", onClick: () => onCreateNode('textNode')},
    {text: "Merge Node", onClick: () => onCreateNode('mergeNode')},
    {text: "Summary Node", onClick: () => onCreateNode('summaryNode')}
  ]

  return (
    <Handle id="source-1" type="source" position={Position.Right}
            className="flex flex-col w-4! h-8! rounded-l-none! rounded-r-full! border-none! translate-x-1! z-[-1]!"
            style={{...style, backgroundColor: 'var(--node-color)'}}>
      <Menu>

        <MenuButton
          className="inline-flex items-center h-10 w-10 ml-5 mt-10 p-2 bg-black/20 rounded-full data-hover:bg-black/30 data-focus:outline-none">
          <Plus className="size-6 text-black"/>
        </MenuButton>

        <MenuItems
          transition
          anchor='bottom start'
          className="origin-top-left flex flex-col rounded-xl bg-white/50 backdrop-blur-md p-1 text-sm/6 font-semibold shadow-md
                transition duration-100 ease-out [--anchor-gap:--spacing(2)] data-closed:scale-95 data-closed:opacity-0"
        >

          {addItem.map((item, index) => (
            <MenuItem key={index}>
              <button onClick={item.onClick}
                      className="group rounded-lg px-2 py-1.5 data-focus:bg-black/10">
                {item.text}
              </button>
            </MenuItem>
          ))}

        </MenuItems>

      </Menu>
    </Handle>
  )
}

export default ConnectionHandle;
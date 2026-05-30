import useStore from "@/store";
import {useStore as useFlowStore} from "@xyflow/react";
import {useShallow} from "zustand/react/shallow";

export const useNodeMove = (nodeId: string) => {
  const {moveNode} = useStore(useShallow((s) => ({moveNode: s.moveNode})));
  const moveAmount = useFlowStore((state) => state.snapGrid[0])

  const moveLeft = () => moveNode(nodeId, {x: moveAmount * -1, y: 0});
  const moveRight = () => moveNode(nodeId, {x: moveAmount, y: 0});
  const moveUp = () => moveNode(nodeId, {x: 0, y: moveAmount * -1});
  const moveDown = () => moveNode(nodeId, {x: 0, y: moveAmount});

  return {moveLeft, moveRight, moveUp, moveDown};
};
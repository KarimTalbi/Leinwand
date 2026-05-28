import {AppState} from "@/types.ts";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {useReactFlow} from "@xyflow/react";

const selector = (state: AppState) => ({
  addNode: state.addNode,
})

export const useCreateNode = () => {
  const {addNode} = useStore(useShallow(selector))
  const {screenToFlowPosition} = useReactFlow()

  const position = () => screenToFlowPosition({x: window.innerWidth / 2, y: window.innerHeight / 2});

  const createPromptNode = () => addNode("promptNode", position());
  const createTextNode = () => addNode("textNode", position());
  const createSummaryNode = () => addNode("summaryNode", position());
  const createMergeNode = () => addNode("mergeNode", position());

  return {createPromptNode, createTextNode, createSummaryNode, createMergeNode}
};
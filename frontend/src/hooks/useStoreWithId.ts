import useStore from "@/store"
import {useShallow} from "zustand/react/shallow";
import {AppState} from "@/types.ts";

const selector = (state: AppState) => ({
  createConnectedNode: state.createConnectedNode,
  deleteNode: state.deleteNode,
});

export const useStoreWithId = (nodeId: string) => {
  const {createConnectedNode, deleteNode} = useStore(useShallow(selector))

  const conPrompt = () => createConnectedNode("promptNode", nodeId)
  const conSummary = () => createConnectedNode("summaryNode", nodeId)
  const conText = () => createConnectedNode("textNode", nodeId)
  const conMerge = () => createConnectedNode("mergeNode", nodeId)

  const deleteNodeAction = () => deleteNode(nodeId)

  return {conPrompt, conSummary, conText, conMerge, deleteNodeAction}

}
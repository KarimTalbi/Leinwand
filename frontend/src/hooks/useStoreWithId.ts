import useStore from "@/store.ts"
import {useShallow} from "zustand/react/shallow";
import {AppState} from "@/types.ts";

const selector = (state: AppState) => ({
  createConnectedNode: state.createConnectedNode,
  promptNodeAction: state.promptNodeAction,
  summaryNodeAction: state.summaryNodeAction,
  deleteNode: state.deleteNode,
});

export const useStoreWithId = (nodeId: string) => {
  const {createConnectedNode, promptNodeAction, summaryNodeAction, deleteNode} = useStore(useShallow(selector))

  const conPrompt = () => createConnectedNode("promptNode", nodeId)
  const conSummary = () => createConnectedNode("summaryNode", nodeId)
  const conText = () => createConnectedNode("textNode", nodeId)
  const conMerge = () => createConnectedNode("mergeNode", nodeId)

  const deleteNodeAction = () => deleteNode(nodeId)

  const promptAction = () => promptNodeAction(nodeId)
  const summaryAction = () => summaryNodeAction(nodeId)

  return {conPrompt, conSummary, conText, conMerge, deleteNodeAction, promptAction, summaryAction}

}
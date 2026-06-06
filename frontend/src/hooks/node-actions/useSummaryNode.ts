import {useState} from 'react';
import useStore from '@/store';
import {streamingSummary} from '@/services/llmService';

/**
 * Manages the run lifecycle for a summary node — streams the condensed LLM
 * response into `updateNodeData` and syncs the canvas when complete.
 */
export function useSummaryNode(nodeId: string) {
  const [isStreaming, setIsStreaming] = useState(false);

  const node = useStore((s) => s.nodes.find((n) => n.id === nodeId));
  const defaultSummaryModel = useStore((s) => s.defaultSummaryModel);
  const defaultModel = useStore((s) => s.defaultModel);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const syncCanvas = useStore((s) => s.syncCanvas);
  const model = defaultSummaryModel?.model ? defaultSummaryModel : defaultModel

  const run = async () => {
    if (!node) return;

    setIsStreaming(true);
    updateNodeData(nodeId, {model: model, response: ''});

    try {
      const token = localStorage.getItem('token') ?? '';
      const nodeWithModel = {...node, data: {...node.data, model: model}};

      await streamingSummary(nodeWithModel, token, (partial) => {
        updateNodeData(nodeId, {response: partial, closed: true});
      });
    } catch (err) {
      console.error('Error summarizing node:', err);
    } finally {
      setIsStreaming(false);
      void syncCanvas();
    }
  };

  return {run, isStreaming};
}
import {useState} from 'react';
import useStore from '@/store';
import {streamingSummary} from '@/services/llmService';

export function useSummaryNode(nodeId: string) {
  const [isStreaming, setIsStreaming] = useState(false);

  const node = useStore((s) => s.nodes.find((n) => n.id === nodeId));
  const defaultModel = useStore((s) => s.defaultModel);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const syncCanvas = useStore((s) => s.syncCanvas);

  const run = async () => {
    if (!node) return;

    setIsStreaming(true);
    updateNodeData(nodeId, {model: defaultModel, response: ''});

    try {
      const token = localStorage.getItem('token') ?? '';
      const nodeWithModel = {...node, data: {...node.data, model: defaultModel}};

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
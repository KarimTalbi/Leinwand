import {useState} from 'react';
import useStore from '@/store';
import {mergeNodes, resolveMerge} from '@/services/mergeService';

export function useMergeNode(nodeId: string) {
  const [isLoading, setIsLoading] = useState(false);

  const node = useStore((s) => s.nodes.find((n) => n.id === nodeId));
  const defaultModel = useStore((s) => s.defaultModel);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const setEdges = useStore((s) => s.setEdges);
  const edges = useStore((s) => s.edges);
  const syncCanvas = useStore((s) => s.syncCanvas);

  const run = async (incomer1: string, incomer2: string, checkStreams: boolean) => {
    if (!node) return;

    setIsLoading(true);
    updateNodeData(nodeId, {model: defaultModel});

    try {
      const nodeWithModel = {...node, data: {...node.data, model: defaultModel}};
      const result = await mergeNodes(nodeWithModel, checkStreams);

      updateNodeData(nodeId, {
        context: result.context,
        problems: result.problems,
        has_issues: result.has_issues,
        incomer1,
        incomer2,
        closed: !result.has_issues,
      });

      if (!result.has_issues) {
        setEdges(edges.filter((e) => e.target !== nodeId));
      }
    } catch (err) {
      console.error('Error merging:', err);
    } finally {
      setIsLoading(false);
      void syncCanvas();
    }
  };

  const resolve = async () => {
    if (!node) return;

    setIsLoading(true);
    await syncCanvas();
    updateNodeData(nodeId, {model: defaultModel});

    try {
      const nodeWithModel = {...node, data: {...node.data, model: defaultModel}};
      const result = await resolveMerge(nodeWithModel);

      updateNodeData(nodeId, {context: result.context, has_issues: false, closed: true});
      setEdges(edges.filter((e) => e.target !== nodeId));
    } catch (err) {
      console.error('Error resolving merge:', err);
    } finally {
      setIsLoading(false);
      void syncCanvas();
    }
  };

  return {run, resolve, isLoading};
}
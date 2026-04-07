import {memo, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Button} from "@headlessui/react";
import {XMarkIcon, PlayIcon} from '@heroicons/react/16/solid'

import useStore from '../store.ts';
import api from '../api.ts'

const MergeNode = ({id}: {id: string}) => {
  const [loading, setLoading] = useState(false);

  const saveCanvas = useStore((s) => s.saveCanvas);
  const setSyncing = useStore((s) => s.setSyncing);
  const addTextNode = useStore((s) => s.addTextNode);
  const position = useStore(s => s.nodes.find(n => n.id === id)?.position)


  const handleGet = async () => {
    setSyncing(true);
    setLoading(true);

    console.log(id)

    try {
      const res = await api.post('/llm/merge', {
        target_id: id,
      });

      // @ts-ignore
      const pos = {
        x: position.x + 200,
        y: position.y
      }

      console.log(res.data.text)

      addTextNode(pos, res.data.text)
      await saveCanvas();

    } catch (err) {
      console.error('Error getting context:', err);

    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center">
    <div className="w-80 h-40 flex flex-col bg-[#f5c45e] rounded-3xl p-0 shadow-2xl">
      <div className="flex items-center justify-between px-6 h-full">

        <div className="text-xl font-bold text-white">MERGE NODE</div>
        <div className="flex items-center gap-3 mr-2">


          <Button
            className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
            <XMarkIcon className="size-10 text-white"/>
          </Button>

          <Button onClick={handleGet} disabled={loading}
                  className="transition-opacity duration-200 hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed">
            <PlayIcon className="size-8 text-white"/>
          </Button>

        </div>
      </div>

        <Handle id="target-1" type="target" position={Position.Left}
                className="w-2! h-4! rounded-l-full! rounded-r-none! border-none! bg-[#f5c45e]! translate-y-10! -translate-x-1! z-[-1]!"/>
        <Handle id="target-2" type="target" position={Position.Left}
                className="w-2! h-4! rounded-l-full! rounded-r-none! border-none! bg-[#f5c45e]! -translate-y-10! -translate-x-1! z-[-1]!"/>
        <Handle id="source-1" type="source" position={Position.Right}
                className="w-2! h-4! rounded-l-none! rounded-r-full! border-none! bg-[#f5c45e]! translate-x-1! z-[-1]!"/>
      </div>
    </div>
  );
};

export default memo(MergeNode);
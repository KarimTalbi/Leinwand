import {memo, useState} from 'react';
import {Handle, Position} from '@xyflow/react';
import {Button, Field, Fieldset, Legend, Label} from "@headlessui/react";
import {XMarkIcon, PlayIcon} from '@heroicons/react/16/solid'

import useStore from '../store.ts';
import api from '../api.ts'
import {MergeNodeData} from "../types.ts";

const MergeNode = ({id, data}: { id: string, data: MergeNodeData }) => {
  const [loading, setLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(data.closed);

  const saveCanvas = useStore((s) => s.saveCanvas);
  const setSyncing = useStore((s) => s.setSyncing);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const deleteNode = useStore((s) => s.deleteNode);

  const handleGet = async () => {
    setSyncing(true);
    setLoading(true);

    try {
      const res = await api.post('/llm/merge', {
        target_id: id,
      });

      console.log(res.data)

      updateNodeData(id, {context: res.data.data, closed: true});
      await saveCanvas();

    } catch (err) {
      console.error('Error getting context:', err);

    } finally {
      setSyncing(false);
      setLoading(false);
      setIsClosed(true);
    }
  };


  return (
    <div className="flex flex-row items-center justify-center">

      {!isClosed ? (

        <div className="w-80 h-40 flex flex-col bg-[#f5c45e] rounded-3xl p-0 shadow-2xl">
          <div className="flex items-center justify-between px-6 h-full">

            <div className="text-xl font-bold text-white">MERGE NODE</div>
            <div className="flex items-center gap-3 mr-2">


              <Button onClick={() => deleteNode(id)} disabled={loading}
                className="w-10 h-10 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
                <XMarkIcon className="size-10 text-white"/>
              </Button>

              <Button onClick={handleGet} disabled={loading || isClosed}
                      className="w-10 h-10 pl-1 transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
                <PlayIcon className="size-8 text-white"/>
              </Button>

            </div>
          </div>

        </div>

      ) : data.context ? (

        <div className="w-130 h-130 flex flex-col bg-[#f5c45e] rounded-3xl p-0 shadow-2xl">
          <div className="flex items-center justify-between px-6 pt-3 shrink-0">

            <div className="text-base font-bold text-white ">MERGE NODE</div>
            <div className="flex items-center gap-6 mr-2">

              <Button onClick={() => deleteNode(id)} disabled={loading}
                className="transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:cursor-not-allowed">
                <XMarkIcon className="size-8 text-white"/>
              </Button>

              <Button onClick={handleGet} disabled={loading || isClosed}
                      className="transition-opacity duration-200 hover:opacity-70 hover:bg-black/10 hover:rounded-full disabled:opacity-30 disabled:cursor-not-allowed">
                <PlayIcon className="size-6 text-white"/>
              </Button>

            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 mt-2 bg-white rounded-3xl">

            <Fieldset className="flex flex-col flex-1 min-h-0 space-y-2 rounded-t-2xl p-2">
              <Field
                className="flex-1 w-full text-black p-2 py-0 rounded-xl min-h-16 overflow-y-auto nowheel">

                {data.context.map((section: any) => {

                  if (section.type === 'promptNode') {
                    return (
                      <Fieldset className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">

                        <div className="flex items-center justify-between">

                          <Legend className="text-lg font-bold mb-2">{section.label}</Legend>
                          <Label className="text-xs mb-2">PROMPT NODE</Label>

                        </div>

                        <div className="flex items-center justify-between">

                          <div className="flex items-center justify-between gap-3">

                            <Label className="text-xs">BRANCH / DEPTH:</Label>
                            <Field className="text-xs font-bold">{section.branch} / {section.depth}</Field>
                          </div>

                          <div className="flex items-center justify-between gap-3">

                            <Label className="text-xs">POSITION</Label>
                            <Field className="text-xs font-bold">
                              [ x: {section.position.x} ][ y: {section.position.y} ]
                            </Field>

                          </div>

                        </div>

                        <div className="my-4 h-px mx-2 bg-black/10"/>

                        <Legend className="text-base font-bold">User</Legend>
                        <Field>{section.prompt}</Field>

                        <div className="my-4 h-px mx-2 bg-black/10"/>

                        <Legend className="text-base font-bold">AI</Legend>
                        <Field>{section.response}</Field>

                      </Fieldset>

                    );
                  }

                  if (section.type === 'textNode') {
                    return (
                      <Fieldset className="bg-gray-200 rounded-2xl my-4 p-4 shadow-md">

                        <div className="flex items-center justify-between">

                          <Legend className="text-lg font-bold mb-2">{section.label}</Legend>
                          <Label className="text-xs mb-2">TEXT NODE</Label>

                        </div>

                        <div className="flex items-center justify-between">

                          <div className="flex items-center justify-between gap-3">

                            <Label className="text-xs">BRANCH / DEPTH:</Label>
                            <Field className="text-xs font-bold">{section.branch} / {section.depth}</Field>
                          </div>

                          <div className="flex items-center justify-between gap-3">

                            <Label className="text-xs">POSITION</Label>
                            <Field className="text-xs font-bold">
                              [ x: {section.position.x} ][ y: {section.position.y} ]
                            </Field>

                          </div>

                        </div>

                        <div className="my-4 h-px mx-2 bg-black/10"/>

                        <Legend className="text-base font-bold">Content:</Legend>
                        <Field>{section.text}</Field>

                      </Fieldset>

                    );
                  }

                  return null;
                })}
              </Field>

            </Fieldset>
          </div>

        </div>

      ) : null}

      <Handle id="target-1" type="target" position={Position.Left}
              className="w-2! h-4! rounded-l-full! rounded-r-none! border-none! bg-[#f5c45e]! translate-y-10! -translate-x-1! z-[-1]!"/>
      <Handle id="target-2" type="target" position={Position.Left}
              className="w-2! h-4! rounded-l-full! rounded-r-none! border-none! bg-[#f5c45e]! -translate-y-10! -translate-x-1! z-[-1]!"/>
      <Handle id="source-1" type="source" position={Position.Right}
              className="w-2! h-4! rounded-l-none! rounded-r-full! border-none! bg-[#f5c45e]! translate-x-1! z-[-1]!"/>

    </div>
  );
};

export default memo(MergeNode);
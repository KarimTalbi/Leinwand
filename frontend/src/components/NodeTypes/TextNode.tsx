import {memo, useLayoutEffect} from 'react';
import {NodeProps} from "@xyflow/react";

import useStore from '@/store.ts';
import {TextNodeType} from "@/types.ts";
import {NodeDisplayMarkdown} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeHeader.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {navbarButtonStyle, NodeBackgroundStyle, nodeColors, NodeForegroundStyle, textareaStyle} from "@/lib/styles.ts";
import {LucideTextCursorInput} from "lucide-react";
import {useTextarea} from "@/hooks/useTextarea.ts";
import {cn} from "@/lib/utils.ts";


const TextNode = ({id, data,}: NodeProps<TextNodeType>) => {

  const {localText, handleTextChange, textareaRef} = useTextarea(id, data.text, "text")
  const {updateNodeData} = useStore(useShallow((s) => ({updateNodeData: s.updateNodeData})));

  const handleClick = () => {
    updateNodeData(id, {closed: !data.closed})
  }

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localText, handleClick]);

  return (
    <div className={NodeBackgroundStyle}>

      <NodeHeader title="Note" id={id} color={nodeColors.textNode}>
        <LucideTextCursorInput size={14} color={nodeColors.textNode} strokeWidth={2.5}/>
      </NodeHeader>

      <div className={NodeForegroundStyle}>
        {!data.closed && (
          <>
            <textarea
              ref={textareaRef}
              value={localText}
              onChange={handleTextChange}
              className={cn(textareaStyle, "min-h-0")}
              placeholder="Enter your note..."
            />

            <div className="flex justify-end pt-1">

              <button
                className={cn(navbarButtonStyle, "btn-xs")}
                onClick={handleClick}
                disabled={!data.text}
              >
                Save
              </button>

            </div>

          </>
        )}

        {data.closed && (
          <>

            <NodeDisplayMarkdown content={data.text || ""} className="px-2"/>

            <div className="flex justify-end pt-1">

              <button
                className={cn(navbarButtonStyle, "btn-xs")}
              >
                Settings
              </button>

              <button
                className={cn(navbarButtonStyle, "btn-xs")}
                onClick={handleClick}
                disabled={!data.text}
              >
                Edit
              </button>

            </div>

          </>
        )}
      </div>

      <ConnectionHandles
        handleId="target-1"
        handleType="target"
        position="top"
        nodeId={id}
        color={nodeColors.textNode}
      />

      {!!data.text && (
        <ConnectionHandles
          handleId="source-1"
          handleType="source"
          position="bottom"
          nodeId={id}
          color={nodeColors.textNode}
        >
          <AddConnectedNode sourceId={id}/>
        </ConnectionHandles>
      )}

    </div>

  )
};

export default memo(TextNode);
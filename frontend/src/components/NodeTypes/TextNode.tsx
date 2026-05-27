import {memo, useLayoutEffect} from 'react';
import {NodeProps} from "@xyflow/react";

import useStore from '@/store.ts';
import {TextNodeType} from "@/types.ts";
import {NodeDisplayMarkdown} from "@/components/NodeElements/TextElements.tsx";
import {NodeHeader} from "@/components/NodeElements/NodeHeader.tsx";
import {ConnectionHandles} from "@/components/NodeElements/ConnectionHandles.tsx";
import {useShallow} from "zustand/react/shallow";
import AddConnectedNode from "@/components/NodeElements/AddConnectedNode.tsx";
import {navbarButtonStyle, NodeBackgroundStyle, nodeTypeProperties, NodeForegroundStyle, textareaStyle} from "@/lib/styles.ts";
import {useTextarea} from "@/hooks/useTextarea.ts";
import {cn} from "@/lib/utils.ts";

type NodeState =
  | 'closed'
  | 'open'
  | 'empty';

const TextNode = ({id, data,}: NodeProps<TextNodeType>) => {
  const {updateNodeData} = useStore(useShallow((s) => ({updateNodeData: s.updateNodeData})));

  const {localText, handleTextChange, textareaRef} = useTextarea(
    data.text || "",
    (value) => updateNodeData(id, {text: value})
  );


  const handleClick = () => {
    updateNodeData(id, {closed: !data.closed})
  };

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localText, handleClick]);

  const getNodeState = (): NodeState => {
    if (data.text) {
      if (data.closed) return 'closed';
      return 'open';
    }
    return 'empty'
  }

  const nodeState = getNodeState();

  return (
    <div className={NodeBackgroundStyle}>

      <NodeHeader
        title="Note"
        id={id}
        color={nodeTypeProperties.textNode.color}
        icon={nodeTypeProperties.textNode.icon}
      />


      <div className={NodeForegroundStyle}>
        {(nodeState === 'empty' || nodeState === 'open') && (
          <>
            <textarea
              ref={textareaRef}
              value={localText}
              onChange={handleTextChange}
              className={cn(textareaStyle, "min-h-0")}
              placeholder="Enter your note..."
            />

            <div className="flex justify-center pt-1">

              <button
                className={cn(navbarButtonStyle, "btn-xs")}
                onClick={handleClick}
                disabled={nodeState === 'empty'}
              >
                Save
              </button>

            </div>
          </>
        )}

        {nodeState === 'closed' && (
          <>

            <NodeDisplayMarkdown content={data.text || ""} className="px-2"/>

            <div className="flex justify-center pt-1">

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
        color={nodeTypeProperties.textNode.color}
      />

      {nodeState !== 'empty' && (
        <ConnectionHandles
          handleId="source-1"
          handleType="source"
          position="bottom"
          nodeId={id}
          color={nodeTypeProperties.textNode.color}
        >
          <AddConnectedNode sourceId={id}/>
        </ConnectionHandles>
      )}

    </div>

  )
};

export default memo(TextNode);
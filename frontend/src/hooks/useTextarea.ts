import React, {useRef, useState} from "react";
import useStore from "@/store.ts";
import {useDebouncedCallback} from "use-debounce";


export const useTextarea = (id: string, initialValue: string, dataKey: string) => {
  const [localText, setLocalText] = useState(initialValue || "");
  const {updateNodeData} = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const debouncedUpdate = useDebouncedCallback((value: string) => {
    updateNodeData(id, {[dataKey]: value});
  }, 500);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    debouncedUpdate(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return { localText, handleTextChange, textareaRef };
};
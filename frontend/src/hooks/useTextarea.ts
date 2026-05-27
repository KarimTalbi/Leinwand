import React, {useRef, useState} from "react";
import {useDebouncedCallback} from "use-debounce";


export const useTextarea = (
  initialValue: string,
  onChange?: (value: string) => void,
  debounceMs = 500,
) => {
  const [localText, setLocalText] = useState(initialValue || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const debouncedUpdate = useDebouncedCallback((value: string) => {
    onChange?.(value);
  }, debounceMs);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
    debouncedUpdate(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return { localText, handleTextChange, textareaRef };
};
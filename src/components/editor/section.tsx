"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TextB, TextItalic, TextUnderline } from "@phosphor-icons/react";
import { toast } from "sonner";

interface EditorSectionProps {
  initialValue: string;
  id: string;
  setValue: (value: string) => void;
  handleSave: () => void;
  updateAt: Date | null;
}

function EditorSection({
  initialValue,
  id,
  setValue,
  handleSave,
  updateAt,
}: EditorSectionProps) {
  const [value, setInternalValue] = useState(initialValue);
  const [charCount, setCharCount] = useState(initialValue.length);
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    if (newValue.length <= 3000) {
      setInternalValue(newValue);
      setValue(newValue);
      addToHistory(newValue);
    } else {
      toast.error("Character limit reached. Maximum 3000 characters allowed.");
    }
  };

  const addToHistory = (newValue: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setInternalValue(history[historyIndex - 1]);
      setValue(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setInternalValue(history[historyIndex + 1]);
      setValue(history[historyIndex + 1]);
    }
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "b":
            event.preventDefault();
            wrapSelection("*");
            break;
          case "i":
            event.preventDefault();
            wrapSelection("_");
            break;
          case "u":
            event.preventDefault();
            wrapSelection("~");
            break;
          case "z":
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case "y":
            event.preventDefault();
            redo();
            break;
        }
      }
    },
    [value]
  );

  const wrapSelection = (wrapper: string) => {
    const textarea = document.getElementById("editor") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      wrapper +
      selectedText +
      wrapper +
      value.substring(end);
    setInternalValue(newText);
    setValue(newText);
    addToHistory(newText);
  };

  return (
    <div className="relative">
      <h1 className="text-xl font-semibold tracking-tight text-brand-gray-900">
        Write Post
      </h1>
      <p className="text-sm text-brand-gray-500">
        Craft your new post. Use *bold*, _italic_, or ~underline~ for
        formatting.
      </p>

      <div className="my-2 flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => wrapSelection("*")}>
          <TextB className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => wrapSelection("_")}>
          <TextItalic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => wrapSelection("~")}>
          <TextUnderline className="h-4 w-4" />
        </Button>
      </div>

      <textarea
        id="editor"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="h-[500px] w-full resize-none whitespace-pre-wrap rounded border border-brand-gray-200 p-2 text-sm focus:outline-none focus:ring-0"
      />

      <div className="mt-2 flex w-full justify-between text-xs text-gray-500">
        <span>
          {updateAt ? (
            `Last saved at: ${updateAt.toLocaleString()} (${
              Intl.DateTimeFormat().resolvedOptions().timeZone
            })`
          ) : (
            <span className="font-medium text-rose-600">
              This draft has not been saved yet.
            </span>
          )}
        </span>
        <span>{charCount}/3000 characters</span>
      </div>

      <div className="flex items-center justify-between border-gray-200 py-4">
        <Button
          className="rounded-lg bg-brand-gray-800 px-[1rem] hover:bg-brand-gray-900"
          onClick={handleSave}
        >
          Save Draft
        </Button>
      </div>
    </div>
  );
}

export default EditorSection;

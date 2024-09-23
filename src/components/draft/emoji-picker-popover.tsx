import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smiley } from "@phosphor-icons/react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useSlate } from "slate-react";
import { Transforms } from "slate";

export const EmojiPickerPopover: React.FC = () => {
  const [open, setOpen] = useState(false);
  const editor = useSlate();

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    Transforms.insertText(editor, emojiData.emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600"
        >
          <Smiley weight="duotone" className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <EmojiPicker
          onEmojiClick={handleEmojiSelect}
          autoFocusSearch={false}
          theme={Theme.LIGHT}
          width="100%"
        />
      </PopoverContent>
    </Popover>
  );
};

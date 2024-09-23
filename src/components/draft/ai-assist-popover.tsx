import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Brain } from "@phosphor-icons/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  TbPencilPlus,
  TbPencilCog,
  TbTextGrammar,
  TbFishHook,
} from "react-icons/tb";
import { PiTextOutdent, PiTextIndent } from "react-icons/pi";
import { HiOutlineSparkles, HiOutlineCursorClick } from "react-icons/hi";
import { PaperPlaneRight } from "@phosphor-icons/react";

interface AIAssistPopoverProps {
  onRewrite: (option: string, customPrompt?: string) => void;
}

export const AIAssistPopover: React.FC<AIAssistPopoverProps> = ({
  onRewrite,
}) => {
  const [open, setOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleOptionClick = (option: string) => {
    onRewrite(option);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600"
        >
          <Brain weight="duotone" className="mr-1 h-4 w-4" />
          AI
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" className="w-56 rounded p-1">
        <ScrollArea className="h-[250px]">
          <div className="flex flex-col rounded">
            {/* AI options buttons */}
            <Button
              variant="ghost"
              className="h-8 justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
              onClick={() => handleOptionClick("continue")}
            >
              <TbPencilPlus className="mr-2 h-5 w-5 stroke-2 text-blue-600" />
              Continue writing
            </Button>
            {/* Add other AI option buttons here */}
            <div className="flex flex-row space-x-1 px-2 py-1">
              <Input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter custom prompt"
                className="h-8 w-full rounded border border-gray-300 px-2 py-1 text-xs"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 items-center justify-center rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                onClick={() => onRewrite("custom", customPrompt)}
                disabled={!customPrompt.trim()}
              >
                <PaperPlaneRight className="h-5 w-5 text-blue-600" />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

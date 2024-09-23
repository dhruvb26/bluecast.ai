import React from "react";
import { Button } from "@/components/ui/button";
import { TextB, TextItalic, TextUnderline } from "@phosphor-icons/react";
import { useSlate } from "slate-react";
import { CustomEditor } from "@/utils/editor-utils";

interface ToolbarButtonProps {
  format: "bold" | "italic" | "underline";
  icon: React.ReactNode;
}

const ToolbarButton = React.memo(({ format, icon }: ToolbarButtonProps) => {
  const editor = useSlate();
  return (
    <Button
      variant="ghost"
      size="icon"
      onMouseDown={(event) => {
        event.preventDefault();
        if (format === "bold") {
          CustomEditor.toggleBoldMark(editor as CustomEditor);
        } else if (format === "italic") {
          CustomEditor.toggleItalicMark(editor as CustomEditor);
        } else if (format === "underline") {
          CustomEditor.toggleUnderlineMark(editor as CustomEditor);
        }
      }}
    >
      {icon}
    </Button>
  );
});

export const Toolbar: React.FC = () => {
  return (
    <div className="flex space-x-2">
      <ToolbarButton format="bold" icon={<TextB className="h-4 w-4" />} />
      <ToolbarButton
        format="italic"
        icon={<TextItalic className="h-4 w-4" />}
      />
      <ToolbarButton
        format="underline"
        icon={<TextUnderline className="h-4 w-4" />}
      />
    </div>
  );
};

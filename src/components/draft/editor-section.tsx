"use client";
import React, { useCallback } from "react";
import {
  Descendant,
  BaseEditor,
  Element as SlateElement,
  Editor,
  Transforms,
} from "slate";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Slate, Editable, ReactEditor, useSlate } from "slate-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  TbFishHook,
  TbPencilCog,
  TbPencilPlus,
  TbTextGrammar,
} from "react-icons/tb";
import { PiTextIndent, PiTextOutdent } from "react-icons/pi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { HiOutlineCursorClick } from "react-icons/hi";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import ScheduleDialog from "@/components/scheduler/schedule-dialog";
import { toast } from "sonner";
import EmojiPicker, { SkinTonePickerLocation } from "emoji-picker-react";
import {
  Brain,
  PaperPlaneRight,
  Smiley,
  Sparkle,
  TextB,
  TextItalic,
  TextUnderline,
} from "@phosphor-icons/react";
import { useUser } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import FileAttachmentButton from "@/components/buttons/file-attachment- button";
import { Loader2, Send } from "lucide-react";
import { HistoryEditor } from "slate-history";
import { deserializeContent, serializeContent } from "@/utils/editor-utils";
import { Input } from "@/components/ui/input";

export type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

export type HeadingElement = {
  type: "heading";
  level: number;
  children: CustomText[];
};

export type CustomElement = ParagraphElement | HeadingElement;
type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};
type CustomText = FormattedText;
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module "slate" {
  interface CustomTypes {
    //@ts-ignore
    Editor: CustomEditor;
    //@ts-ignore
    Element: CustomElement;
    Text: CustomText;
  }
}

const CustomEditor = {
  isBoldMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  toggleBoldMark(editor: CustomEditor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },

  isItalicMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },

  toggleItalicMark(editor: CustomEditor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "italic");
    } else {
      Editor.addMark(editor, "italic", true);
    }
  },

  isUnderlineMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.underline === true : false;
  },

  toggleUnderlineMark(editor: CustomEditor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "underline");
    } else {
      Editor.addMark(editor, "underline", true);
    }
  },
};

export const extractContent = (value: Descendant[]): string => {
  return value
    .map((n) =>
      SlateElement.isElement(n) ? n.children.map((c) => c.text).join("") : ""
    )
    .join("");
};

interface EditorSectionProps {
  initialValue: string | Descendant[];
  id: string;
  setValue: (value: Descendant[]) => void;
  editor: CustomEditor;
  handleSave: () => void;
  setFileType: any;
  initialDocumentUrn: string | null;
  updateAt: Date | null;
}

function EditorSection({
  initialValue,
  id,
  setValue,
  editor,
  handleSave,
  initialDocumentUrn,
  setFileType,
  updateAt,
}: EditorSectionProps) {
  const [value, setInternalValue] = useState<Descendant[]>(() => {
    if (typeof initialValue === "string") {
      try {
        return deserializeContent(initialValue);
      } catch (e) {
        // If deserialization fails, treat it as plain text
        return [{ type: "paragraph", children: [{ text: initialValue }] }];
      }
    }
    return initialValue;
  });

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case "paragraph":
        return <p {...props.attributes}>{props.children}</p>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    const { leaf, attributes, children } = props;
    const text = leaf.text;

    // Check if the text is a special character
    // const isSpecialChar = /[(){}&*^%$#@!]/.test(text);

    // if (isSpecialChar) {
    //   // Return the special character without any formatting
    //   return <span {...attributes}>{children}</span>;
    // }

    return (
      <span
        {...attributes}
        style={{
          fontWeight: leaf.bold ? "bold" : "normal",
          fontStyle: leaf.italic ? "italic" : "normal",
          textDecoration: leaf.underline ? "underline" : "none",
        }}
      >
        {children}
      </span>
    );
  }, []);

  const [charCount, setCharCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = useCallback(
    (emoji: any) => {
      const { selection } = editor;
      if (selection) {
        Transforms.insertText(editor, emoji.emoji, { at: selection });
      } else {
        Transforms.insertText(editor, emoji.emoji, {
          at: Editor.end(editor, []),
        });
      }
      setShowEmojiPicker(false);
    },
    [editor]
  );

  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      const content = newValue
        .map((n) =>
          SlateElement.isElement(n)
            ? n.children.map((c) => c.text).join("")
            : ""
        )
        .join("");
      const newCharCount = content.length;

      if (newCharCount <= 3000) {
        setInternalValue(newValue);
        setValue(newValue);
        setCharCount(newCharCount);
      } else {
        // If the new content exceeds 3000 characters, truncate it
        const truncatedContent = content.slice(0, 3000);
        const truncatedValue = [
          { type: "paragraph", children: [{ text: truncatedContent }] },
        ];
        setInternalValue(truncatedValue as Descendant[]);
        setValue(truncatedValue as Descendant[]);
        setCharCount(3000);

        // Optionally, you can show a toast only when the limit is first reached
        if (charCount < 3000) {
          toast.error(
            "Character limit reached. Maximum 3000 characters allowed."
          );
        }
      }
    },
    [setValue, charCount]
  );

  const [isPublishing, setIsPublishing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const customStyles = {
    "--epr-emoji-size": "24px",
    "--epr-picker-border-radius": "4px",
    "--epr-emoji-gap": "8px",
    "--epr-hover-bg-color": "#f0f0f0",
    "--epr-bg-color": "#ffffff",
    "--epr-category-label-bg-color": "#ffffff",
    "--epr-text-color": "#101828",
    "--epr-category-icon-active-color": "#ffffff",
    "--epr-search-input-bg-color": "#dbeafe",
    "--epr-search-input-text-color": "#1d4ed8",
    "--epr-search-input-placeholder-color": "#2563eb",
    "--epr-category-navigation-button-size": "0px",
    "--epr-preview-height": "50px",
  } as React.CSSProperties;

  const { user } = useUser();

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const publishData: any = {
        postId: id,
        userId: user?.id,
      };

      const response = await fetch("/api/linkedin/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(publishData),
      });

      if (!response.ok) {
        throw new Error("Failed to publish post");
      }

      const result: any = await response.json();

      const link = `https://www.linkedin.com/feed/update/${result.urn}/`;

      toast.success(
        <span>
          Post published successfully.{" "}
          <a
            href={link}
            className="font-semibold text-green-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here
          </a>
        </span>
      );
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast.info("Publishing cancelled");
      } else {
        console.error("Error publishing post:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to publish post."
        );
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!event.ctrlKey && !event.metaKey) return;

      switch (event.key) {
        case "b":
          event.preventDefault();
          CustomEditor.toggleBoldMark(editor);
          break;
        case "i":
          event.preventDefault();
          CustomEditor.toggleItalicMark(editor);
          break;
        case "u":
          event.preventDefault();
          CustomEditor.toggleUnderlineMark(editor);
          break;
        case "z":
          event.preventDefault();
          if (event.shiftKey) {
            editor.redo();
          } else {
            editor.undo();
          }
          break;
        case "y":
          if (event.ctrlKey) {
            event.preventDefault();
            editor.redo();
          }
          break;
      }
    },
    [editor]
  );
  const handleRewrite = useCallback(
    async (option: string) => {
      const { selection } = editor;
      if (!selection && option !== "hook" && option !== "cta") {
        toast.error("Please select some text to rewrite.");
        return;
      }

      setIsRewriting(true);

      const selectedText = selection ? Editor.string(editor, selection) : "";
      const fullContent = extractContent(value);

      try {
        const response = await fetch("/api/ai/rewrite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedText,
            fullContent,
            option,
            customPrompt,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to rewrite text");
        }

        const { rewrittenText } = (await response.json()) as any;

        if (!rewrittenText) {
          throw new Error("Rewritten text is empty");
        }

        if (selection) {
          // Replace the selected text with the rewritten text
          Transforms.select(editor, selection);
          Transforms.delete(editor);
          Transforms.insertText(editor, rewrittenText);
        } else {
          // Insert the new content at the current cursor position
          Transforms.insertText(editor, rewrittenText);
        }

        toast.success("Text rewritten successfully.");
      } catch (error) {
        console.error("Error rewriting text:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to rewrite text."
        );
      } finally {
        setIsRewriting(false);
        setCustomPrompt("");
      }
    },
    [editor, value, customPrompt]
  );

  const handleOptionClick = (option: string) => {
    handleRewrite(option);
  };

  const handleDocumentUploaded = useCallback(
    async (fileType: string) => {
      if (fileType === "pdf" || fileType === "document") {
        toast.success(`Document uploaded successfully.`);
        window.location.reload();
      } else if (fileType === "video") {
        toast.success(`Video uploaded successfully.`);
        window.location.reload();
      } else {
        toast.success(`Image uploaded successfully.`);
        window.location.reload();
      }
      setFileType(fileType);
    },

    [id, setFileType]
  );

  return (
    <>
      <div className="relative">
        <div className="text-left mb-2 px-4 pt-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Write Post
          </h1>
          <p className="text-sm  text-muted-foreground ">
            Use our AI-powered rewrite feature for assistance when needed.
          </p>
        </div>

        <Slate editor={editor} initialValue={value} onChange={handleChange}>
          <div className="m-2 flex space-x-2">
            <ToolbarButton format="bold" icon={<TextB className="h-4 w-4" />} />
            <ToolbarButton
              format="italic"
              icon={<TextItalic className="h-4 w-4" />}
            />
            <ToolbarButton
              format="underline"
              icon={<TextUnderline className="h-4 w-4" />}
            />

            <Separator orientation="vertical" className="h-8" />

            <FileAttachmentButton
              postId={id}
              onFileUploaded={handleDocumentUploaded}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smiley weight="duotone" className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Emoji</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600"
                  disabled={isRewriting}
                >
                  <Sparkle weight="duotone" className="mr-1 h-4 w-4" />
                  AI
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                className="w-56 rounded p-1"
                style={{ position: "absolute" }}
              >
                <ScrollArea className="h-[250px]">
                  <div className="flex flex-col rounded">
                    <div className="flex flex-row space-x-1 p-1">
                      <Input
                        type="text"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Custom Instructions"
                        className="h-8 w-full rounded border border-gray-300 px-2 py-1 text-xs"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 items-center justify-center rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                        onClick={() => handleOptionClick("custom")}
                        disabled={!customPrompt.trim()}
                      >
                        <PaperPlaneRight className="h-5 w-5 text-blue-600" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-8 justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                      onClick={() => handleOptionClick("continue")}
                    >
                      <TbPencilPlus className="mr-2 h-5 w-5 stroke-2 text-blue-600" />
                      Continue writing
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8  justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                      onClick={() => handleOptionClick("improve")}
                    >
                      <TbPencilCog className="mr-2 h-5 w-5 text-blue-600" />
                      Improve writing
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8  justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                      onClick={() => handleOptionClick("fixGrammar")}
                    >
                      <TbTextGrammar className="mr-2 h-5 w-5 text-blue-600" />
                      Fix grammar
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8  justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                      onClick={() => handleOptionClick("makeShorter")}
                    >
                      <PiTextOutdent className="mr-2 h-5 w-5 text-blue-600" />
                      Make shorter
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8  justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                      onClick={() => handleOptionClick("makeLonger")}
                    >
                      <PiTextIndent className="mr-2 h-5 w-5 text-blue-600" />
                      Make longer
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                      onClick={() => handleOptionClick("simplify")}
                    >
                      <HiOutlineSparkles className="mr-2 h-5 w-5 text-blue-600" />
                      Simplify text
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-8 justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                      onClick={() => handleOptionClick("hook")}
                    >
                      <TbFishHook className="mr-2 h-5 w-5 text-blue-600" />
                      Add a hook
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 justify-start rounded text-sm font-normal text-black hover:bg-brand-gray-50 hover:text-blue-600"
                      onClick={() => handleOptionClick("cta")}
                    >
                      <HiOutlineCursorClick className="mr-2 h-5 w-5 text-blue-600" />
                      Add a CTA
                    </Button>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {showEmojiPicker && (
            <div className="absolute z-10">
              <EmojiPicker
                style={customStyles}
                width={450}
                skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
                height={450}
                onEmojiClick={handleEmojiSelect}
              />
            </div>
          )}

          <div className="h-[600px] border-y overflow-y-scroll">
            <Editable
              onKeyDown={handleKeyDown}
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              className="min-h-full w-full resize-none whitespace-pre-wrap  p-2 text-sm focus:outline-none focus:ring-0"
            />
          </div>
        </Slate>
        <div className="mt-2 flex w-full justify-between text-xs text-gray-500 px-4">
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
      </div>
      <div className="flex items-center justify-between border-gray-200 px-4 py-2">
        <Button onClick={handleSave} disabled={isPublishing}>
          Save Draft
        </Button>
        <div className="flex space-x-2">
          <ScheduleDialog id={id} disabled={isPublishing} />
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isPublishing ? "Publishing" : "Publish"}
          </Button>
        </div>
      </div>
    </>
  );
}

const ToolbarButton = ({
  format,
  icon,
}: {
  format: string;
  icon: React.ReactNode;
}) => {
  const editor = useSlate() as CustomEditor;
  return (
    <Button
      variant="ghost"
      size="icon"
      onMouseDown={(event) => {
        event.preventDefault();
        if (format === "bold") {
          CustomEditor.toggleBoldMark(editor);
        } else if (format === "italic") {
          CustomEditor.toggleItalicMark(editor);
        } else if (format === "underline") {
          CustomEditor.toggleUnderlineMark(editor);
        }
      }}
    >
      {icon}
    </Button>
  );
};

export default EditorSection;

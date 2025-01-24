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
import { Button } from "@/components/ui/button";
import { Range } from "slate";
import { TbFishHook, TbPencilCog, TbPencilPlus } from "react-icons/tb";
import { HiOutlineSparkles } from "react-icons/hi2";
import { HiOutlineCursorClick } from "react-icons/hi";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import ScheduleDialog from "@/components/scheduler/schedule-dialog";
import { toast } from "sonner";
import EmojiPicker, { SkinTonePickerLocation } from "emoji-picker-react";
import {
  MagicWand,
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
import {
  CircleCheckBig,
  IndentDecrease,
  IndentIncrease,
  Pencil,
  PenSquare,
  Save,
  Send,
  Sparkles,
  Trash,
  Trash2,
} from "lucide-react";
import { HistoryEditor } from "slate-history";
import { deserializeContent } from "@/utils/editor-utils";
import { Loader2 } from "lucide-react";
import { getLinkedInId } from "@/actions/user";
import LinkedInConnect from "../global/connect-linkedin";
import { usePostStore } from "@/store/post";

import { useRouter } from "next/navigation";
import { deleteDraft, updateDraftField } from "@/actions/draft";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

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
  initialName: string | null;
  workspaceId: string | undefined;
  status: string | null;
}

function EditorSection({
  initialValue,
  id,
  setValue,
  editor,
  handleSave,
  initialDocumentUrn,
  status,
  setFileType,
  updateAt,
  initialName,
  workspaceId,
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
  const [name, setName] = useState(initialName);
  const [isOpen, setIsOpen] = useState(false);

  const saveName = async () => {
    try {
      const response = await updateDraftField(id, "name", name || "");
      if (!response.success) {
        toast.error("Failed to update draft name");
        return;
      }
      setIsOpen(false);
      toast.success("Draft name updated successfully.");
    } catch (error) {
      console.error("Error updating draft name:", error);
      toast.error("Failed to update draft name");
    }
  };

  const handleDeleteDraft = async () => {
    try {
      const response = await deleteDraft(id);
      if (!response.success) {
        toast.error("Failed to delete draft");
        return;
      }
      toast.success("Draft deleted successfully");
      router.push("/saved/posts"); // Redirect to drafts list
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    }
  };

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
  const [selectedText, setSelectedText] = useState("");

  const customStyles = {
    "--epr-emoji-size": "24px",
    "--epr-picker-border-radius": "4px",
    "--epr-emoji-gap": "8px",
    "--epr-hover-bg-color": "#f0f0f0",
    "--epr-bg-color": "#ffffff",
    "--epr-category-label-bg-color": "#ffffff",
    "--epr-text-color": "#101828",
    "--epr-category-icon-active-color": "#ffffff",
    "--epr-category-navigation-button-size": "0px",
    "--epr-preview-height": "50px",
  } as React.CSSProperties;

  const { user } = useUser();
  const { showLinkedInConnect, setShowLinkedInConnect } = usePostStore();
  const router = useRouter();
  const handlePublish = async () => {
    handleSave();
    setIsPublishing(true);

    try {
      const linkedInAccount = await getLinkedInId();
      if (!linkedInAccount || linkedInAccount.length === 0) {
        setIsPublishing(false);
        setShowLinkedInConnect(true);
        return;
      }
    } catch (error) {
      console.error("Error getting LinkedIn ID:", error);
      toast.error(
        "Failed to retrieve LinkedIn account information. Please try again."
      );

      setIsPublishing(false);
      setShowLinkedInConnect(true);
      return <LinkedInConnect />;
    }

    try {
      const publishData: any = {
        postId: id,
        userId: user?.id,
        workspaceId: workspaceId,
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

      if (result.status === "progress") {
        toast.success("Your post is being processed.", { duration: 5000 });
        router.push("/saved/posts?tab=progress");
      } else {
        const link = `https://www.linkedin.com/feed/update/${result.urn}/`;

        toast.success(
          <span className="flex items-center text-sm space-x-1">
            Post published successfully.{" "}
            <a
              href={link}
              className="font-semibold text-green-700 ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Click here
            </a>
          </span>
        );
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast.error("Publishing cancelled");
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
      let textToRewrite = selectedText;

      if (
        !textToRewrite &&
        option !== "hook" &&
        option !== "cta" &&
        option !== "continue"
      ) {
        toast.error("Please select some text to rewrite.");
        return;
      }

      setIsRewriting(true);

      try {
        const response = await fetch("/api/ai/rewrite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedText: textToRewrite,
            fullContent: extractContent(value),
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

        const { selection } = editor;
        if (option === "hook") {
          // Prepend the hook at the beginning of the document
          Transforms.insertNodes(
            editor,
            [
              { type: "paragraph", children: [{ text: rewrittenText }] },
              { type: "paragraph", children: [{ text: "" }] },
            ],
            { at: [0] }
          );
        } else if (option === "cta") {
          // Append the CTA at the end of the document
          Transforms.insertNodes(
            editor,
            [
              { type: "paragraph", children: [{ text: "" }] },
              { type: "paragraph", children: [{ text: rewrittenText }] },
            ],
            { at: Editor.end(editor, []) }
          );
        } else if (selection && !Range.isCollapsed(selection)) {
          // For other options, replace the selected text
          Transforms.delete(editor);
          Transforms.insertText(editor, rewrittenText);
        } else {
          // If there's no current selection, insert at the end
          Transforms.select(editor, Editor.end(editor, []));
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
    [editor, value, customPrompt, selectedText]
  );

  const handleOptionClick = (option: string) => {
    handleRewrite(option);
  };

  const handleDocumentUploaded = async (fileType: string) => {
    handleSave();
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
  };

  [id, setFileType];

  return (
    <>
      {showLinkedInConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <LinkedInConnect />
        </div>
      )}
      <div className="relative">
        <div className="text-left px-4 pt-8">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Write Post
          </h1>
          <p className="text-sm  text-muted-foreground ">
            Use our AI-powered rewrite feature for assistance when needed.
          </p>
        </div>

        <Slate
          editor={editor}
          initialValue={value}
          onChange={(newValue) => {
            handleChange(newValue);
            const { selection } = editor;
            if (selection && !Range.isCollapsed(selection)) {
              setSelectedText(Editor.string(editor, selection));
            } else {
              setSelectedText("");
            }
          }}
        >
          <div className="m-2 flex space-x-1">
            <Input
              className="text-sm max-w-[250px] ml-2"
              value={name || "Untitled"}
              disabled
            />
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setIsOpen(true)}
                  variant="ghost"
                  size="icon"
                  className="mx-2"
                >
                  <PenSquare className="stroke-1 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Draft</DialogTitle>
                  <DialogDescription>
                    Update your draft name or delete the draft.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Enter draft name"
                    value={name || ""}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-4"
                  />
                </div>
                <DialogFooter className="flex justify-between">
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setName(initialName);
                        setIsOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveName}>Save</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                    <Smiley className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Emoji</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-600"
                  loading={isRewriting}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const { selection } = editor;
                    if (selection && !Range.isCollapsed(selection)) {
                      setSelectedText(Editor.string(editor, selection));
                    }
                  }}
                >
                  <MagicWand weight="duotone" className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="right"
                className="w-56 rounded p-1"
                style={{ position: "absolute" }}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                {/* <ScrollArea className="h-[250px]"> */}
                <div className="flex flex-col rounded">
                  <Button
                    variant="ghost"
                    className="h-8 justify-start rounded text-sm font-normal"
                    onClick={() => handleOptionClick("continue")}
                  >
                    <TbPencilPlus className="mr-2 h-5 w-5 stroke-1.25 text-blue-600" />
                    Continue writing
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8  justify-start rounded text-sm font-normal"
                    onClick={() => handleOptionClick("improve")}
                  >
                    <TbPencilCog className="mr-2 h-5 w-5 text-blue-600" />
                    Improve writing
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8  justify-start rounded text-sm font-normal"
                    onClick={() => handleOptionClick("fixGrammar")}
                  >
                    <CircleCheckBig className="mr-2 h-4 w-4 text-blue-600" />
                    Fix grammar
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8  justify-start rounded text-sm font-normal"
                    onClick={() => handleOptionClick("makeShorter")}
                  >
                    <IndentDecrease className="mr-2 h-5 w-5 text-blue-600 stroke-2" />
                    Make shorter
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8  justify-start rounded text-sm font-normal"
                    onClick={() => handleOptionClick("makeLonger")}
                  >
                    <IndentIncrease className="mr-2 h-5 w-5 text-blue-600 stroke-2" />
                    Make longer
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 justify-start rounded text-sm font-normal"
                    onClick={() => handleOptionClick("simplify")}
                  >
                    <HiOutlineSparkles className="mr-2 h-5 w-5 text-blue-600" />
                    Simplify text
                  </Button>

                  <Button
                    variant="ghost"
                    className="h-8 justify-start rounded text-sm font-normal"
                    onClick={() => handleOptionClick("hook")}
                  >
                    <TbFishHook className="mr-2 h-5 w-5 text-blue-600" />
                    Add a hook
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 justify-start rounded text-sm font-normal"
                    onClick={() => handleOptionClick("cta")}
                  >
                    <HiOutlineCursorClick className="mr-2 h-5 w-5 text-blue-600" />
                    Add a CTA
                  </Button>
                </div>
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
        <div className="mt-2 mb-8 flex w-full justify-between text-xs text-gray-500 px-4">
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
        {status !== "published" && (
          <>
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={isPublishing}>
                Save Draft
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold tracking-tight">
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your draft.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteDraft()}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex space-x-2">
              <ScheduleDialog id={id} disabled={isPublishing} />
              <Button onClick={handlePublish} loading={isPublishing}>
                {isPublishing ? "Publishing" : "Publish"}
              </Button>
            </div>
          </>
        )}
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

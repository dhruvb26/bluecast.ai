"use client";

import React, { useState } from "react";
import {
  HardDrive,
  DownloadSimple,
  PencilSimple,
  ArrowRight,
} from "@phosphor-icons/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePostStore } from "@/store/post";
import { saveDraft } from "@/actions/draft";
import { Edit, Save, Copy, ArrowUpRight } from "lucide-react";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

const parseContent = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    } else if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

export function GeneratedContent() {
  const [copied, setCopied] = useState(false);
  const { linkedInPost, isLoading, error, isStreamComplete } = usePostStore();
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(linkedInPost).then(() => {
      setCopied(true);
      toast.success("Content copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    if (!linkedInPost) return;

    try {
      const result = await saveDraft(uuid(), linkedInPost);

      if (result.success) {
        toast.success("Draft saved successfully.");
      } else {
        toast.error(result.error || "Failed to save draft.");
      }
    } catch (error) {
      toast.error("An error occurred while saving the draft.");
    }
  };

  const handleEdit = async () => {
    if (!linkedInPost) return;

    try {
      const draftId = uuid();
      const result = await saveDraft(draftId, linkedInPost);

      if (result.success) {
        router.push(`/draft/${draftId}`);
      } else {
        toast.error(result.error || "Failed to save draft.");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("An error occurred while saving the draft.");
    }
  };

  if (isLoading || linkedInPost) {
    return (
      <div className=" h-[90vh] flex flex-col">
        <div className="space-x-2 justify-end flex mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={!isStreamComplete || copied}
                >
                  {copied ? "Copied!" : <Copy size={15} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!isStreamComplete}
                  onClick={handleSave}
                >
                  <Save size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!isStreamComplete}
                  onClick={handleEdit}
                >
                  <Edit size={15} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col rounded-lg border border-input">
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="whitespace-pre-wrap pr-4 text-sm">
                {parseContent(linkedInPost)}
              </div>
              {!isStreamComplete && isLoading && (
                <div className="flex h-full w-full items-center justify-center">
                  <BarLoader color="#1d51d7" height={3} width={150} />
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[90vh] flex-col items-center justify-center rounded-lg border border-input p-6">
        <p className="text-sm text-red-500">{error.message}</p>
        {/* {error.cause === "blog" && (
          <p className="text-sm mt-2">
            <span
              onClick={() => router.push("/blog-tips")}
              className="cursor-pointer text-primary hover:underline"
            >
              Click here for the PDF{" "}
              <ArrowRight size={12} className="inline text-foreground" />{" "}
              LinkedIn template.
            </span>
          </p>
        )} */}
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] flex-col items-center justify-center rounded-lg border border-input p-6">
      <HardDrive
        className="mx-auto text-muted-foreground"
        weight="light"
        size={42}
      />
      <p className="text-sm text-muted-foreground">Nothing generated yet.</p>
      <p className="text-sm text-muted-foreground mt-1">
        See your saved posts{" "}
        <span
          onClick={() => router.push("/saved/posts")}
          className="cursor-pointer inline text-primary group"
        >
          here
          <ArrowUpRight
            size={16}
            className="inline transition-transform group-hover:translate-y-[-2px] group-hover:translate-x-[2px]"
          />
        </span>
      </p>
    </div>
  );
}

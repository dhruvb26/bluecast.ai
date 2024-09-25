"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDrafts } from "@/actions/draft";
import { parseContent } from "@/utils/editor-utils";
import { toast } from "sonner";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Draft } from "@/actions/draft";
import ScheduleDialog from "./schedule-dialog";
import { Plus } from "@phosphor-icons/react";

export function SchedulePostDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    const result = await getDrafts();
    if (result.success) {
      setDrafts(result.data || []);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="min-h-[80vh] sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-black">
            Schedule Posts
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-gray-500">
            View all your posts and schedule them for future publication.
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-[500px] w-full">
          <ScrollArea className="w-1/2 pr-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className={`mb-4 rounded-lg p-4 transition-all duration-200 ${
                  selectedDraft?.id === draft.id
                    ? "bg-blue-100"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => setSelectedDraft(draft)}
              >
                <div className="mb-2 text-sm font-semibold">
                  {draft.name || "Untitled"}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Last updated: {new Date(draft.updatedAt).toLocaleString()}
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm mb-2">
                  {parseContent(draft.content || "").slice(0, 100)}...
                </pre>
              </div>
            ))}
          </ScrollArea>
          <div className="w-1/2 pl-4">
            {selectedDraft ? (
              <div className="h-full w-full rounded-lg border p-4 overflow-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {parseContent(selectedDraft.content || "")}
                </pre>
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                Select a draft to preview
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          {selectedDraft && (
            <ScheduleDialog id={selectedDraft.id} disabled={false} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

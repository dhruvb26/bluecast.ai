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
import { getDrafts, saveDraft } from "@/actions/draft";
import { parseContent } from "@/utils/editor-utils";
import { toast } from "sonner";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Draft } from "@/actions/draft";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../ui/textarea";
import { Empty } from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookDashed, PenSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { BarLoader } from "react-spinners";
import GridCirclePlusLine from "../icons/grid-circle-plus-line";

interface PostsDialogProps {
  onSelect: (content: string) => Promise<void>;
  triggerText: string;
  onOpenDialog?: (e: React.MouseEvent) => void;
}

export function PostsDialog({
  onSelect,
  triggerText,
  onOpenDialog,
}: PostsDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<Draft[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const draftsResult = await getDrafts("saved");
    const scheduledResult = await getDrafts("scheduled");
    const publishedResult = await getDrafts("published");

    if (draftsResult.success) {
      setDrafts(draftsResult.data || []);
    } else {
      toast.error(draftsResult.error);
    }

    if (scheduledResult.success) {
      setScheduledPosts(scheduledResult.data || []);
    } else {
      toast.error(scheduledResult.error);
    }

    if (publishedResult.success) {
      setPublishedPosts(publishedResult.data || []);
    } else {
      toast.error(publishedResult.error);
    }
    setIsLoading(false);
  };

  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [editedPost, setEditedPost] = useState<string | null>(null);

  const handleUsePost = async () => {
    if (editedPost) {
      await onSelect(editedPost);
      setIsDialogOpen(false);
    } else {
      toast.error("Please select and optionally edit a post before using it.");
    }
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedPost(e.target.value);
  };

  const renderPostList = (posts: Draft[]) => (
    <div className="flex h-[500px] w-full">
      {isLoading ? (
        <div className="flex items-center justify-center w-full">
          <BarLoader color="#2563eb" height={3} width={300} />
        </div>
      ) : posts.length > 0 ? (
        <>
          <ScrollArea className="w-1/2 pr-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`mb-4 rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                  selectedPost === post.id
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white border border-input"
                }`}
                onClick={() => {
                  setSelectedPost(post.id);
                  setEditedPost(parseContent(post.content || ""));
                }}
              >
                <div className="mb-2 text-sm font-semibold">
                  {post.name || "Untitled"}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Status: {post.status} | Last updated:{" "}
                  {new Date(post.updatedAt).toLocaleString()}
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {parseContent(post.content || "")}
                </pre>
              </div>
            ))}
          </ScrollArea>
          <div className="w-1/2 pl-4">
            <Textarea
              className="h-full w-full rounded-lg border-brand-gray-200 text-sm"
              value={editedPost || ""}
              onChange={handlePostChange}
              placeholder="Select a post on the left to edit"
            />
          </div>
        </>
      ) : (
        <div className="items-center justify-center h-full w-full flex flex-col">
          <Empty className="w-12 h-12 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            No posts available.
          </span>
          <span className="text-sm text-center text-muted-foreground">
            Start your writing journey.
          </span>
          <div className="flex flex-row space-x-2">
            <Button onClick={handleCreateDraft} className="mt-4">
              <PenSquare size={18} className="mx-1.5" />
              Write Post
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/create/posts")}
              className="mt-4"
            >
              Explore Templates
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const handleCreateDraft = async () => {
    const id = uuid();
    await saveDraft(id, "");
    router.push(`/draft/${id}`);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset the selected post and edited post when the dialog is closed
      setSelectedPost(null);
      setEditedPost(null);
    }
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={(e) => {
                  onOpenDialog?.(e);
                  setIsDialogOpen(true);
                }}
              >
                <Plus size={16} className="mr-1" />
                {triggerText}
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>

      <DialogContent className="min-h-[80vh] sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-black">
            Your Posts
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-gray-500">
            View all your posts, including drafts, scheduled, and published
            content.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="drafts" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
          <TabsContent value="drafts">{renderPostList(drafts)}</TabsContent>
          <TabsContent value="scheduled">
            {renderPostList(scheduledPosts)}
          </TabsContent>
          <TabsContent value="published">
            {renderPostList(publishedPosts)}
          </TabsContent>
        </Tabs>
        <div className="flex justify-end space-x-2 py-2">
          <Button onClick={handleUsePost}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../ui/textarea";
import { Plus } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostsDialogProps {
  onSelect: (content: string) => Promise<void>;
}

export function PostsDialog({ onSelect }: PostsDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<Draft[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Draft[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
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
    </div>
  );
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
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus size={15} weight="bold" className="mr-1" />
                Add Post
              </Button>
            </TooltipTrigger>
            {/* <TooltipContent>
              <p>Add Post</p>
            </TooltipContent> */}
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

"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Trash } from "lucide-react";
import { Badge } from "./badge";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PenSquare } from "lucide-react";
import { Button } from "./button";
import { Eye } from "@phosphor-icons/react";

export const ParallaxScroll = ({
  posts,
  className,
  onDeleteDraft,
}: {
  posts: {
    id: string;
    name: string;
    content: any;
    status: string;
    updatedAt: Date;
  }[];
  className?: string;
  onDeleteDraft: (id: string) => void;
}) => {
  const gridRef = useRef<any>(null);
  const router = useRouter();

  const third = Math.ceil(posts.length / 3);

  const firstPart = posts.slice(0, third);
  const secondPart = posts.slice(third, 2 * third);
  const thirdPart = posts.slice(2 * third);

  const renderContent = (content: any) => {
    const maxLength = 90; // Adjust this value to change the cutoff point
    let totalLength = 0;
    let truncatedContent = [];

    for (let node of content) {
      if (node.type === "paragraph") {
        for (let child of node.children) {
          if (totalLength + child.text.length <= maxLength) {
            truncatedContent.push(child.text);
            totalLength += child.text.length;
          } else {
            const remainingSpace = maxLength - totalLength;
            truncatedContent.push(child.text.slice(0, remainingSpace));
            truncatedContent.push("...");
            return truncatedContent.join(" ");
          }
        }
      }
    }

    return truncatedContent.join(" ");
  };

  const cancelSchedule = async (postId: string) => {
    try {
      const response = await fetch("/api/schedule", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel schedule");
      }

      toast.success("Post scheduling cancelled.");
      window.location.reload();
    } catch (error) {
      toast.error("Error cancelling the scheduled post.");
      console.error("Error cancelling schedule:", error);
    }
  };

  const PostCard = ({ post }: { post: any }) => (
    <div className="mb-6 rounded-md border border-input hover:-translate-y-1 transition-all bg-white p-4 hover:shadow-sm h-[175px] flex flex-col justify-between">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-sm text-foreground">
              {post.name}
            </span>{" "}
          </p>
          <p className="text-xs text-muted-foreground">
            {post.updatedAt.toLocaleString()}
          </p>
        </div>

        <div className="mb-4 text-sm text-muted-foreground overflow-hidden">
          {renderContent(post.content)}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <Badge
            className={
              post.status === "published"
                ? "bg-green-50 text-xs font-normal text-green-600 hover:bg-green-100"
                : post.status === "scheduled"
                ? "bg-yellow-50 text-xs font-normal text-yellow-600 hover:bg-yellow-100"
                : post.status === "progress"
                ? "bg-orange-50 text-xs font-normal text-orange-600 hover:bg-orange-100"
                : "bg-blue-50 text-xs font-normal text-blue-600 hover:bg-blue-100"
            }
          >
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size={"sm"}
                    variant={
                      post.status === "published" ? "outline" : undefined
                    }
                    className={
                      post.status === "published"
                        ? ""
                        : "to-brand-blue-secondary from-brand-blue-primary bg-gradient-to-r border-blue-500 shadow-md border"
                    }
                    onClick={() =>
                      router.push(
                        post.status === "published"
                          ? `/draft/${post.id}`
                          : `/draft/${post.id}`
                      )
                    }
                  >
                    {post.status === "published" ? (
                      <Eye size={15} />
                    ) : (
                      <PenSquare size={15} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{post.status === "published" ? "View" : "Edit"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {post.status === "scheduled" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      onClick={() => cancelSchedule(post.id)}
                    >
                      <Clock size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cancel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {post.status !== "scheduled" && post.status !== "published" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      onClick={() => onDeleteDraft(post.id)}
                    >
                      <Trash size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn("h-[40rem] w-full overflow-y-auto", className)}
      ref={gridRef}
    >
      <div className="grid grid-cols-1 items-start gap-6  py-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid gap-6">
          {firstPart.map((post, idx) => (
            <PostCard key={`grid-1-${idx}`} post={post} />
          ))}
        </div>
        <div className="grid gap-6">
          {secondPart.map((post, idx) => (
            <PostCard key={`grid-2-${idx}`} post={post} />
          ))}
        </div>
        <div className="grid gap-6">
          {thirdPart.map((post, idx) => (
            <PostCard key={`grid-3-${idx}`} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

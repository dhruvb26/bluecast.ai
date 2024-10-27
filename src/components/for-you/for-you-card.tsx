"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GlobeHemisphereWest, ArrowsOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from "uuid";
import ContentViewer from "../draft/content-viewer";
import { saveDraft } from "@/actions/draft";
import { PenSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { FloatingPanel } from "../ui/floating-panel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback } from "../ui/avatar";
import ReactionGrid from "../inspiration/reaction-grid";
import LikeIcon from "../icons/like-icon";
import SendIcon from "../icons/send-icon";
import RepostIcon from "../icons/repost-icon";
import CommentIcon from "../icons/comment-icon";

interface ForYouCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      headline: string;
      image: string;
    };
  };
}

const ForYouCard: React.FC<ForYouCardProps> = ({ post }) => {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDeviceBasedOnSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        if (containerWidth <= 320) {
          setDevice("mobile");
        } else if (containerWidth <= 480) {
          setDevice("tablet");
        } else {
          setDevice("desktop");
        }
      }
    };

    updateDeviceBasedOnSize();
    window.addEventListener("resize", updateDeviceBasedOnSize);

    return () => {
      window.removeEventListener("resize", updateDeviceBasedOnSize);
    };
  }, []);

  const handleClick = async () => {
    const id = uuid();
    try {
      const result = await saveDraft(id, post.content);
      if (result.success) {
        window.location.href = `/draft/${id}`;
      } else {
        console.error("Failed to save draft:", result.error);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const handleSave = async () => {
    const id = uuid();
    try {
      const result = await saveDraft(id, post.content);
      if (result.success) {
        toast.success("Post saved successfully.");
      } else {
        console.error("Failed to save draft:", result.error);
        toast.error("Failed to save post.");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div
        ref={containerRef}
        className="w-full rounded-md bg-white border border-input"
      >
        <div className="flex items-center justify-between p-4 py-2">
          <div className="flex items-center">
            <div className="relative mr-2 h-12 w-12 flex-shrink-0">
              {post.user.image ? (
                <Image
                  height={48}
                  width={48}
                  src={post.user.image}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover"
                  quality={100}
                />
              ) : (
                <Avatar>
                  <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="min-w-0 flex-grow">
              <p className="truncate text-sm font-semibold text-foreground">
                {post.user.name}
              </p>
              {post.user.headline && (
                <p className="line-clamp-1 w-full overflow-hidden text-ellipsis text-xs text-muted-foreground">
                  {post.user.headline}
                </p>
              )}
              <p className="flex items-center text-xs text-gray-500">
                Now •
                <span className="ml-1">
                  <GlobeHemisphereWest weight="fill" />
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-4">
          <ContentViewer
            disabled={true}
            postId={post.id}
            value={[{ type: "paragraph", children: [{ text: post.content }] }]}
          />
        </div>

        <div className="mx-4 border-t border-gray-200 pt-2 pb-4">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <FloatingPanel.Root>
                <FloatingPanel.Trigger tooltipContent="Expand" title={""}>
                  <ArrowsOut weight="bold" size={15} />
                </FloatingPanel.Trigger>
                <FloatingPanel.Content>
                  <FloatingPanel.Body className="px-4 justify-center flex flex-col items-center">
                    <FloatingPanel.Header className="w-full justify-between px-12 flex">
                      <FloatingPanel.CloseButton />
                      <div className="flex flex-row space-x-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size={"sm"}
                              variant={"outline"}
                              onClick={handleSave}
                            >
                              <Save size={15} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Save</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size={"sm"}
                              className="to-brand-blue-secondary from-brand-blue-primary bg-gradient-to-r border-blue-500 shadow-md border"
                              onClick={handleClick}
                            >
                              <PenSquare size={15} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </div>
                    </FloatingPanel.Header>

                    <div className="max-w-[500px] rounded-md shadow-md">
                      <div className="mb-2 flex items-center p-4">
                        <div className="relative mr-2 h-12 w-12 flex-shrink-0">
                          {post.user.image ? (
                            <Image
                              height={48}
                              width={48}
                              src={post.user.image}
                              alt="Profile"
                              className="h-full w-full rounded-full object-cover"
                              quality={100}
                            />
                          ) : (
                            <Avatar>
                              <AvatarFallback>
                                {post.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="text-sm font-semibold text-black">
                            {post.user.name}
                          </p>
                          <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                            {post.user.headline}
                          </p>
                          <p className="flex items-center text-xs text-muted-foreground">
                            Now •
                            <span className="ml-1">
                              <GlobeHemisphereWest weight="fill" />
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="px-4">
                        <ContentViewer
                          expanded={true}
                          postId={post.id}
                          value={[
                            {
                              type: "paragraph",
                              children: [{ text: post.content }],
                            },
                          ]}
                        />
                      </div>
                      <div className="px-2 mt-2">
                        <ReactionGrid
                          numLikes={Math.floor(Math.random() * 100)}
                          numEmpathy={Math.floor(Math.random() * 50)}
                          numInterests={Math.floor(Math.random() * 30)}
                          numAppreciations={Math.floor(Math.random() * 20)}
                          numComments={Math.floor(Math.random() * 10)}
                          numReposts={Math.floor(Math.random() * 5)}
                        />
                      </div>
                      <div className="border-t border-gray-200 mx-4 p-4">
                        <div className="flex items-center justify-between">
                          {[
                            {
                              name: "Like",
                              icon: <LikeIcon width={20} height={20} />,
                            },
                            {
                              name: "Comment",
                              icon: <CommentIcon width={20} height={20} />,
                            },
                            {
                              name: "Repost",
                              icon: <RepostIcon width={16} height={16} />,
                            },
                            {
                              name: "Send",
                              icon: <SendIcon width={20} height={20} />,
                            },
                          ].map((action) => (
                            <Button
                              size={"sm"}
                              key={action.name}
                              className="flex flex-1 flex-row items-center justify-center space-x-1 rounded-lg bg-white px-1 py-2 transition-colors duration-200 ease-in-out hover:bg-white"
                            >
                              <span className="text-sm text-muted-foreground">
                                {action.icon}
                              </span>
                              <span className="mt-1 text-xs font-medium text-muted-foreground">
                                {action.name}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <FloatingPanel.Footer>
                      <></>
                    </FloatingPanel.Footer>
                  </FloatingPanel.Body>
                </FloatingPanel.Content>
              </FloatingPanel.Root>

              <div className="flex flex-row space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"sm"}
                      variant={"outline"}
                      onClick={handleSave}
                    >
                      <Save size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"sm"}
                      className="to-brand-blue-secondary from-brand-blue-primary bg-gradient-to-r border-blue-500 shadow-md border"
                      onClick={handleClick}
                    >
                      <PenSquare size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForYouCard;

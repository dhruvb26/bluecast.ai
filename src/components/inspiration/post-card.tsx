"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GlobeHemisphereWest, ArrowsOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import ReactionGrid from "./reaction-grid";
import { v4 as uuid } from "uuid";
import ContentViewer from "../draft/content-viewer";

import { saveDraft } from "@/actions/draft";
import dynamic from "next/dynamic";
import { Loader2, PenSquare, Save } from "lucide-react";

import { toast } from "sonner";
import { FloatingPanel } from "../ui/floating-panel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SendIcon from "../icons/send-icon";
import LikeIcon from "../icons/like-icon";
import CommentIcon from "../icons/comment-icon";
import RepostIcon from "../icons/repost-icon";
import { Avatar, AvatarFallback } from "../ui/avatar";
const PdfViewerComponent = dynamic(
  () => import("@/components/draft/pdf-viewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center">
        <Loader2 className="mb-2 h-4 w-4 animate-spin text-blue-600" />
      </div>
    ),
  }
);

interface PostCardProps {
  post: {
    id: string;
    creatorId: string;
    images?: { url: string }[];
    document?: Record<string, any> | null;
    video?: Record<string, any> | null;
    numAppreciations: number;
    numComments: number;
    numEmpathy: number;
    numInterests: number;
    numLikes: number;
    numReposts: number;
    postUrl: string;
    reshared: boolean;
    text: string;
    time: string;
    urn: string;
    createdAt: string;
    updatedAt: string;
    creator: {
      id: string;
      profileUrl: string;
      fullName: string;
      profileImageUrl: string;
      headline: string;
    };
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(
    "desktop"
  );
  const [showContent, setShowContent] = useState(false);
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

  const renderContent = () => {
    if (post.images && post.images.length > 0) {
      return (
        <Image
          src={post.images[0]?.url}
          alt="Post image"
          width={500}
          height={500}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            aspectRatio: "1 / 1",
          }}
        />
      );
    } else if (post.document) {
      return <></>;
    } else if (post.video) {
      return (
        <video src={post.video.stream_url} controls className="h-auto w-fit">
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  const handleClick = async () => {
    const id = uuid();
    try {
      const result = await saveDraft(id, post.text);
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
      const result = await saveDraft(id, post.text);
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
              {post.creator.profileImageUrl ? (
                <Image
                  height={48}
                  width={48}
                  src={post.creator.profileImageUrl}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover"
                  quality={100}
                />
              ) : (
                <Avatar>
                  <AvatarFallback>
                    {post.creator.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="min-w-0 flex-grow">
              <p className="truncate text-sm font-semibold text-foreground">
                {post.creator.fullName}
              </p>
              {post.creator.headline && (
                <p className="line-clamp-1 w-full overflow-hidden text-ellipsis text-xs text-muted-foreground">
                  {post.creator.headline}
                </p>
              )}
              <p className="flex items-center text-xs text-gray-500">
                {post.time} •
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
            value={[{ type: "paragraph", children: [{ text: post.text }] }]}
          />
        </div>

        {showContent && renderContent()}
        <ReactionGrid
          numLikes={post.numLikes}
          numEmpathy={post.numEmpathy}
          numInterests={post.numInterests}
          numAppreciations={post.numAppreciations}
          numComments={post.numComments}
          numReposts={post.numReposts}
        />
        <div className="mx-4 border-t border-gray-200 pt-2 pb-4">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <FloatingPanel.Root>
                <FloatingPanel.Trigger tooltipContent="Expand" title={""}>
                  <ArrowsOut weight="bold" size={15} />
                </FloatingPanel.Trigger>
                <FloatingPanel.Content>
                  <FloatingPanel.Body className="px-4 justify-center flex flex-col items-center">
                    <FloatingPanel.Header
                      className="w-full justify-between px-12
                     flex"
                    >
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
                              className="to-brand-blue-secondary  from-brand-blue-primary bg-gradient-to-r border-blue-500 shadow-md border"
                              onClick={handleClick}
                            >
                              <PenSquare size={15} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </div>
                    </FloatingPanel.Header>

                    <div className="max-w-[500px] rounded-md shadow-md ">
                      <div className="mb-2 flex items-center p-4">
                        <div className="relative mr-2 h-12 w-12 flex-shrink-0">
                          {post.creator.profileImageUrl ? (
                            <Image
                              height={48}
                              width={48}
                              src={post.creator.profileImageUrl}
                              alt="Profile"
                              className="h-full w-full rounded-full object-cover"
                              quality={100}
                            />
                          ) : (
                            <Avatar>
                              <AvatarFallback>
                                {post.creator.fullName?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <p className="text-sm font-semibold text-black">
                            {post.creator.fullName || ""}
                          </p>
                          <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                            {post.creator.headline?.length > 50
                              ? `${post.creator.headline.slice(0, 50)}...`
                              : post.creator.headline}
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
                              children: [{ text: post.text }],
                            },
                          ]}
                        />
                      </div>
                      <div className="mt-2 flex w-full flex-col items-center justify-center">
                        {renderContent()}
                      </div>
                      <div className="px-2 mt-2">
                        <ReactionGrid
                          numLikes={post.numLikes}
                          numEmpathy={post.numEmpathy}
                          numInterests={post.numInterests}
                          numAppreciations={post.numAppreciations}
                          numComments={post.numComments}
                          numReposts={post.numReposts}
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
                      className="to-brand-blue-secondary  from-brand-blue-primary bg-gradient-to-r border-blue-500 shadow-md border"
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

export default PostCard;

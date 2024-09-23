"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { getUser } from "@/actions/user";
import { Descendant } from "slate";
import ContentViewer from "./content-viewer";
import { getDraftField, removeDraftField } from "@/actions/draft";
import { MdSmartphone, MdTablet, MdLaptop } from "react-icons/md";
import { GlobeHemisphereWest } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import LikeIcon from "@/components/icons/like-icon";
import CommentIcon from "@/components/icons/comment-icon";
import RepostIcon from "@/components/icons/repost-icon";
import SendIcon from "@/components/icons/send-icon";

const PdfViewerComponent = dynamic(() => import("./pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center">
      <Loader2 className="mb-2 h-4 w-4 animate-spin text-blue-600" />
    </div>
  ),
});

interface LinkedInPostPreviewProps {
  content: Descendant[];
  device: "mobile" | "tablet" | "desktop";
  postId: string;
}

const LinkedInPostPreview: React.FC<LinkedInPostPreviewProps> = ({
  content,
  device: initialDevice,
  postId,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(
    "mobile"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDeviceBasedOnSize = useCallback(() => {
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
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const titleResult = await getDraftField(postId, "documentTitle");

      if (titleResult.success) {
        setDocumentTitle(titleResult.data || "");
      }

      const result = await getDraftField(postId, "downloadUrl");

      if (result.success) {
        console.log("Getting download URL: ", result.data);
        setDownloadUrl(result.data as string);

        const response = await fetch(result.data as string, {
          method: "GET",
        });
        const type = response.headers.get("Content-Type");
        if (type) {
          setContentType(type);
          console.log("Content type: ", type);
        } else {
          console.error("Content-Type header is missing");
          setContentType("unknown");
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An error occurred while fetching data");
      console.error(err);
    }
  }, [postId]);

  const handleDelete = useCallback(async () => {
    try {
      const result = await removeDraftField(postId, "downloadUrl");
      await removeDraftField(postId, "documentUrn");
      await removeDraftField(postId, "documentTitle");
      if (result.success) {
        setDownloadUrl(null);
        setContentType(null);
        window.location.reload();
      } else {
        console.error("Failed to remove download URL:", result.error);
      }
    } catch (error) {
      console.error("Error removing download URL:", error);
    }
  }, [postId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    updateDeviceBasedOnSize();
    window.addEventListener("resize", updateDeviceBasedOnSize);

    return () => {
      window.removeEventListener("resize", updateDeviceBasedOnSize);
    };
  }, [updateDeviceBasedOnSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderContent = () => {
    if (!downloadUrl) return null;

    console.log("Rendering content. Content type:", contentType);

    const content = (
      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isHovering && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-2 flex justify-end">
            <Button size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
        {contentType?.startsWith("image/") && (
          <img
            src={downloadUrl}
            alt="Content"
            className="h-auto w-full object-contain"
          />
        )}
        {contentType === "application/pdf" && (
          <PdfViewerComponent
            title={documentTitle || "PDF Document"}
            file={downloadUrl}
            device={device}
          />
        )}
        {contentType?.startsWith("video/") && (
          <video src={downloadUrl} controls className="h-auto w-full">
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );

    if (
      !contentType?.startsWith("image/") &&
      contentType !== "application/pdf" &&
      !contentType?.startsWith("video/")
    ) {
      console.log("Unhandled content type:", contentType);
      return null;
    }

    return content;
  };

  if (isLoading) {
    return <div></div>;
  }

  if (error || !user) {
    return <div>Error: {error || "Failed to load user data"}</div>;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mb-4 flex items-center justify-center">
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setDevice("mobile")}
            className={`rounded-full p-2 ${
              device === "mobile" ? "text-blue-600" : "text-muted-foreground"
            }`}
          >
            <MdSmartphone size={24} />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`rounded-full p-2 ${
              device === "tablet" ? "text-blue-600" : "text-muted-foreground"
            }`}
          >
            <MdTablet size={24} />
          </button>
          <button
            onClick={() => setDevice("desktop")}
            className={`rounded-full p-2 ${
              device === "desktop" ? "text-blue-600" : "text-muted-foreground"
            }`}
          >
            <MdLaptop size={24} />
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={`w-full rounded bg-white shadow ${
          device === "mobile"
            ? "max-w-[320px]"
            : device === "tablet"
            ? "max-w-[480px]"
            : "max-w-[560px]"
        }`}
      >
        <div className="mb-2 flex items-center p-4">
          <div className="relative mr-2 h-12 w-12 flex-shrink-0">
            <Image
              height={48}
              width={48}
              src={user.image || "/placeholder.svg"}
              alt="Profile"
              className="h-full w-full rounded-full object-cover"
              quality={100}
            />
          </div>
          <div className="min-w-0 flex-grow">
            <p className="text-sm font-semibold text-black">
              {user.name || ""}
            </p>

            <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
              {user.headline}
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
          <ContentViewer postId={postId} value={content} />
        </div>

        {downloadUrl && (
          <div className="mt-2 flex flex-col items-center justify-center">
            {renderContent()}
          </div>
        )}

        <div className="border-t border-gray-200 p-4">
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
              { name: "Repost", icon: <RepostIcon width={14} height={14} /> },
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
    </div>
  );
};

export default LinkedInPostPreview;

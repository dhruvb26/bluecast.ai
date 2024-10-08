"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Draft, getDraft, getDraftField } from "@/actions/draft";
import { Badge } from "@/components/ui/badge";
import {
  CalendarBlank,
  Check,
  Circle,
  Clock,
  ClockCounterClockwise,
  PencilSimpleLine,
  TrashSimple,
} from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import dynamic from "next/dynamic";
import { getUser } from "@/actions/user";
import { deleteDraft } from "@/actions/draft";
import {
  ChatCircleText,
  GlobeHemisphereWest,
  PaperPlaneTilt,
  Repeat,
  ThumbsUp,
} from "@phosphor-icons/react";
import { BadgeCheck, Clock4, ClockArrowUp, Loader2 } from "lucide-react";
import ContentViewer from "../draft/content-viewer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toZonedTime } from "date-fns-tz";

const PdfViewerComponent = dynamic(() => import("../draft/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center">
      <Loader2 className="mb-2 h-4 w-4 animate-spin text-blue-600" />
    </div>
  ),
});

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  headline?: string | null;
}

interface DraftCardProps {
  draft: Draft;
  style?: React.CSSProperties; // Add this line

  view: "1week" | "2weeks" | "month";
}

const DraftCard: React.FC<DraftCardProps> = ({ draft, view, style }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useRouter();

  const renderContent = (content: any) => {
    if (view === "2weeks" || view === "month") return null;

    const maxLength = 10;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUser();
        setUser(userData as User);

        // const titleResult = await getDraftDocumentTitle(draft.id);
        const titleResult = await getDraftField(draft.id, "documentTitle");

        if (titleResult.success) {
          setDocumentTitle(titleResult.data || "");
        }

        const result = await getDraftField(draft.id, "downloadUrl");

        if (result.success) {
          setDownloadUrl(result.data as string);

          const response = await fetch(result.data as string, {
            method: "GET",
          });
          const type = response.headers.get("Content-Type");
          if (type) {
            setContentType(type);
          } else {
            setContentType("unknown");
          }
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error(err);
      }
    };

    fetchData();
  }, [draft.id]);

  const renderPreviewContent = () => {
    if (!downloadUrl) return null;

    if (contentType?.startsWith("image/")) {
      return (
        <div className="relative h-full w-full">
          <Image
            src={downloadUrl}
            alt="Content"
            layout="responsive"
            width={100}
            height={100}
            objectFit="contain"
          />
        </div>
      );
    } else if (contentType === "application/pdf") {
      return (
        <PdfViewerComponent
          title={documentTitle || "PDF Document"}
          file={downloadUrl}
          device="mobile"
        />
      );
    } else if (contentType?.startsWith("video/")) {
      return (
        <video controls className="w-full">
          <source src={downloadUrl} type={contentType} />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return null;
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteDraft(draft.id);
      if (result.success) {
        toast.success("Draft successfully deleted.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the draft.");
      console.error(error);
    } finally {
      setIsAlertOpen(false);
      setIsSheetOpen(false);
    }
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

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <div
          style={style}
          className="relative  bg-white max-w-sm cursor-pointer rounded-lg border border-blue-600  transition-all duration-300 ease-in-out hover:shadow-sm hover:-translate-y-0.5 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          {view === "1week" &&
            draft.downloadUrl &&
            (draft.documentUrn?.includes("document") ? (
              <div className="relative flex h-[50px] w-full items-center justify-center overflow-hidden rounded-t-lg bg-gray-200">
                <iframe
                  src={draft.downloadUrl}
                  title="PDF Preview"
                  className="h-full w-full"
                />
              </div>
            ) : draft.documentUrn?.includes("video") ? (
              <div className="relative h-[50px] w-full overflow-hidden rounded-t-lg bg-gray-200">
                <video className="h-full w-full object-cover">
                  <source src={draft.downloadUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="relative h-[50px] w-full overflow-hidden rounded-t-lg">
                <Image
                  src={draft.downloadUrl || ""}
                  alt="Draft Image"
                  layout="fill"
                  objectFit="cover"
                  objectPosition="top"
                />
              </div>
            ))}

          <div className={`p-4 ${view !== "1week" ? "py-2" : ""}`}>
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`${
                  view === "1week" ? "text-sm" : "text-xs"
                } font-medium flex items-start flex-row tracking-tight text-foreground transition-colors duration-300 ease-in-out group-hover:text-brand-gray-700 dark:text-white dark:group-hover:text-gray-300`}
              >
                <div className="flex items-center justify-center p-2 mr-2 rounded-md bg-blue-50">
                  {draft.status === "scheduled" ? (
                    <Clock4 size={16} className="stroke-2 text-blue-500" />
                  ) : (
                    <BadgeCheck size={16} className="stroke-2 text-blue-500" />
                  )}
                </div>
                {(draft.name && draft.name.length > 15
                  ? draft.name.slice(0, 15) + "..."
                  : draft.name) || "Untitled Post"}
              </span>
              {/* <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-white text-blue-600 hover:bg-white hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAlertOpen(true);
                          }}
                        >
                          <TrashSimple size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold tracking-tight">
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                      This action cannot be undone. This will permanently delete
                      your draft.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg text-sm">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-lg bg-blue-600 text-sm hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog> */}
            </div>
            {/* {view === "1week" && (
              <p className="mb-3 text-xs text-brand-gray-500 transition-colors duration-300 ease-in-out group-hover:text-brand-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                {renderContent(JSON.parse(draft.content || ""))}
              </p>
            )} */}
            <div className="flex items-center space-x-2">
              {draft.status === "scheduled" ? (
                <Circle
                  weight="duotone"
                  size={10}
                  className="text-blue-600 transition-colors duration-300 ease-in-out group-hover:text-blue-500"
                />
              ) : (
                <Check
                  weight="duotone"
                  size={12}
                  className="text-blue-600 transition-colors duration-300 ease-in-out group-hover:text-blue-500"
                />
              )}
              <p className="text-xs font-normal text-blue-500 transition-colors duration-300 ease-in-out group-hover:text-brand-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                {draft.scheduledFor?.toLocaleString(undefined, {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-start space-x-2 text-lg font-semibold tracking-tight">
            <span>
              {(draft.name && draft.name.length > 15
                ? draft.name.slice(0, 15) + "..."
                : draft.name) || "Untitled Post"}
            </span>
            <Badge className="space-x-1 bg-green-50 font-normal text-green-600 hover:bg-green-100">
              <span>
                {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
              </span>
              {draft.status === "scheduled" ? (
                <CalendarBlank weight="duotone" size={16} />
              ) : (
                <Check weight="bold" size={16} />
              )}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        <SheetDescription className="mt-6">
          <div className="flex w-full flex-col items-center justify-center shadow">
            <div className="w-full rounded bg-white shadow">
              <div className="mb-2 flex items-center p-3">
                <div className="relative mr-2 h-12 w-12 flex-shrink-0">
                  <img
                    src={user?.image || "https://i.pravatar.cc/300"}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-sm font-semibold text-black">
                    {user?.name || "..."}
                  </p>
                  {user?.headline && (
                    <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-brand-gray-500">
                      {user.headline}
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

              <div className="px-3 text-sm">
                <ContentViewer
                  value={JSON.parse(draft.content || "")}
                  postId={draft.id}
                />
              </div>

              {downloadUrl && (
                <div className="mt-2 w-full">{renderPreviewContent()}</div>
              )}

              <div className=" border-t border-brand-gray-200 p-3">
                <div className="flex items-center justify-between">
                  {[
                    {
                      name: "Like",
                      icon: (
                        <ThumbsUp
                          className="scale-x-[-1] transform"
                          weight="fill"
                          size={16}
                        />
                      ),
                    },
                    {
                      name: "Comment",
                      icon: <ChatCircleText weight="fill" size={16} />,
                    },
                    {
                      name: "Repost",
                      icon: <Repeat weight="bold" size={16} />,
                    },
                    {
                      name: "Send",
                      icon: <PaperPlaneTilt weight="fill" size={16} />,
                    },
                  ].map((action) => (
                    <Button
                      size="sm"
                      key={action.name}
                      className="flex flex-1 flex-row items-center justify-center space-x-1 rounded-lg bg-white px-1 py-1 transition-colors duration-200 ease-in-out hover:bg-white"
                    >
                      <span className="text-brand-gray-500">{action.icon}</span>
                      <span className="text-xs font-medium text-brand-gray-500">
                        {action.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="my-4 w-full space-y-2 text-xs text-gray-600">
            <p>
              <span className="font-medium">Scheduled for:</span>{" "}
              {draft.scheduledFor && draft.timeZone
                ? toZonedTime(
                    draft.scheduledFor,
                    draft.timeZone
                  ).toLocaleString() +
                  " " +
                  "(" +
                  draft.timeZone +
                  ")"
                : "Not scheduled"}
            </p>
            <p>
              <span className="font-medium">Created:</span>{" "}
              {draft.createdAt.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Updated:</span>{" "}
              {draft.updatedAt.toLocaleString()}
            </p>
          </div>
          {draft.status !== "published" && (
            <div className="flex space-x-2">
              <Link href={`/draft/${draft.id}`} passHref className="w-full">
                <Button className="mt-2 w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Edit
                  <PencilSimpleLine className="ml-2" weight="bold" size={16} />
                </Button>
              </Link>
              <Button
                onClick={() => cancelSchedule(draft.id)}
                variant={"outline"}
                className="mt-2 w-full rounded-lg text-black"
              >
                Cancel Schedule
                <Clock className="ml-2" weight="bold" size={16} />
              </Button>
            </div>
          )}
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );
};

export default DraftCard;

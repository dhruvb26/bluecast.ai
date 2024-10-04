"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Draft, getDraftField } from "@/actions/draft";
import { Check, Circle, Clock } from "@phosphor-icons/react";
import { getUser } from "@/actions/user";
import { BadgeCheck, Clock4, PenSquare, Trash, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  headline?: string | null;
}

interface DraftCardProps {
  draft: Draft;
  style?: React.CSSProperties;
  view: "1week" | "2weeks" | "month";
}

const DraftCard: React.FC<DraftCardProps> = ({ draft, view, style }) => {
  const [user, setUser] = useState<User | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);

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
    <div
      style={style}
      className=" bg-white max-w-sm cursor-pointer rounded-lg border border-blue-600 transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 flex flex-row"
    >
      <div className={`p-4 ${view !== "1week" ? "py-2" : ""}`}>
        <div className="mb-2 flex items-center justify-between">
          <span
            className={`${
              view === "1week" ? "text-sm" : "text-xs"
            } font-medium flex items-start flex-row tracking-tight text-foreground transition-colors duration-300 ease-in-out group-hover:text-brand-gray-700 dark:text-white dark:group-hover:text-gray-300`}
          >
            {(draft.name && draft.name.length > 15
              ? draft.name.slice(0, 15) + "..."
              : draft.name) || "Untitled Post"}
          </span>
        </div>

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
      <div className="flex flex-col items-center justify-center px-2 space-y-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Link href={`/draft/${draft.id}`}>
                  <PenSquare size={15} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cancelSchedule(draft.id)}
              >
                <Clock weight="bold" size={15} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default DraftCard;

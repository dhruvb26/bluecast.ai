"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Draft, getDraftField } from "@/actions/draft";
import { Check, Circle } from "@phosphor-icons/react";
import { getUser } from "@/actions/user";
import { BadgeCheck, Clock4 } from "lucide-react";

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

  return (
    // <Link href={`/draft/${draft.id}`}>
    <div
      style={style}
      className="relative  bg-white max-w-sm cursor-pointer rounded-lg border border-blue-600  transition-all duration-300 ease-in-out hover:shadow-sm hover:-translate-y-0.5 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
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
    </div>
    // </Link>
  );
};

export default DraftCard;

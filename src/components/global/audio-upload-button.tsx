"use client";

import { UploadButton } from "@/utils/uploadthing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUploadStore } from "@/store/post";
import { Cross, TrashSimple, X } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { RecordAudioModal } from "../audio/record-audio-modal";

export default function AudioUploadButton() {
  const { url, setUrl } = useUploadStore();

  const handleDelete = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      const response = await fetch("/api/uploadthing", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setUrl("");
        toast.success("File deleted successfully.");
      } else {
        throw new Error("Failed to delete file");
      }
    } catch (error: any) {
      toast.error(`Error deleting file: ${error.message}`);
    }
  };

  return (
    <main className="flex w-full items-start gap-2">
      <UploadButton
        className="ut-button:bg-primary ut-button:w-full ut-button:mx-0 ut-button:h-9 ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-normal ut-button:ring-0"
        endpoint="audioUploader"
        content={{
          button: "Choose",
        }}
        onClientUploadComplete={(res) => {
          console.log("Files: ", res);
          if (res && res[0]?.url) {
            setUrl(res[0].url);
          }
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
      />
      {/* <RecordAudioModal /> */}
      <Input
        type="text"
        value={url}
        disabled
        className="w-fit flex-grow"
        placeholder="Uploaded file URL will appear here"
      />

      {url && (
        <Button onClick={handleDelete} size="icon" variant="outline">
          <TrashSimple />
        </Button>
      )}
    </main>
  );
}

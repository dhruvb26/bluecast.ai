"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Paperclip } from "@phosphor-icons/react";
import { updateDraftField } from "@/actions/draft";
import { toast } from "sonner";
import { getLinkedInId } from "@/actions/user";
import LinkedInConnect from "../global/connect-linkedin";
import { usePostStore } from "@/store/post";
import { UploadButton } from "@/utils/uploadthing";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { DialogDescription } from "@radix-ui/react-dialog";

const FileAttachmentButton = ({
  postId,
  onFileUploaded,
}: {
  onFileUploaded: (fileType: string) => void;
  postId: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const { showLinkedInConnect, setShowLinkedInConnect } = usePostStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if the file is an MP4 and exceeds 50 MB
      if (file.type === "video/mp4" && file.size > 50 * 1024 * 1024) {
        toast.error("MP4 files must be 50 MB or smaller.");
        return;
      }

      // Check if the file is an image or PDF and exceeds 64 MB
      if (
        (file.type.startsWith("image/") || file.type === "application/pdf") &&
        file.size > 64 * 1024 * 1024
      ) {
        toast.error("Image and PDF files must be 64 MB or smaller.");
        return;
      }

      setSelectedFile(file);
      if (file.type === "application/pdf" || file.type === "video/mp4") {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleAttach = async () => {
    if (selectedFile) {
      setIsUploading(true);

      try {
        const linkedInAccount = await getLinkedInId();
        if (!linkedInAccount || linkedInAccount.length === 0) {
          setIsUploading(false);
          setIsOpen(false);
          setShowLinkedInConnect(true);
          return;
        }
      } catch (error) {
        console.error("Error getting LinkedIn ID:", error);
        toast.error(
          "Failed to retrieve LinkedIn account information. Please try again."
        );

        setIsUploading(false);
        setShowLinkedInConnect(true);
        return <LinkedInConnect />;
      }

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("postId", postId);
        if (
          selectedFile.type === "application/pdf" ||
          selectedFile.type === "video/mp4"
        ) {
          formData.append("documentName", documentName);
        }

        const isDocument = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(selectedFile.type);

        const isVideo = selectedFile.type === "video/mp4";

        let endpoint = isDocument
          ? "/api/linkedin/file-upload"
          : isVideo
          ? "/api/linkedin/video-upload"
          : "/api/linkedin/image-upload";

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: any = await response.json();

        if (result.success) {
          let fileType = isDocument
            ? selectedFile.type === "application/pdf"
              ? "pdf"
              : "document"
            : isVideo
            ? "video"
            : "image";

          if (isDocument || isVideo) {
            await updateDraftField(postId, "documentTitle", documentName);
          }

          onFileUploaded(fileType);
          setSelectedFile(null);
          setDocumentName("");
          setIsOpen(false);
        } else {
          console.error(
            result.message || "Upload failed. Try a smaller size file."
          );
          toast.error(
            result.message || "Upload failed. Try a smaller size file."
          );
        }
      } catch (error: any) {
        console.error("Error in file upload process:", error.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Paperclip weight="light" size={22} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <DialogContent aria-description="Upload" aria-describedby={"Upload"}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Attach File
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Upload a file to attach to your post.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col space-y-3 py-4">
              <div>
                <Input
                  id="file-upload"
                  type="file"
                  className="mb-1"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/gif,image/png,image/heic,image/heif,image/webp,image/bmp,image/tiff,.pdf,application/pdf"
                />
              </div>
              {selectedFile &&
                (selectedFile.type === "application/pdf" ||
                  selectedFile.type === "video/mp4") && (
                  <div>
                    <Input
                      className="mb-1"
                      type="text"
                      placeholder="Enter document name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      This name will appear as the title for your document on
                      LinkedIn.
                    </p>
                  </div>
                )}
              <div className="flex flex-col justify-center items-center">
                <Button
                  className="w-full"
                  loading={isUploading}
                  onClick={handleAttach}
                  disabled={
                    !selectedFile ||
                    isUploading ||
                    ((selectedFile.type === "application/pdf" ||
                      selectedFile.type === "video/mp4") &&
                      !documentName)
                  }
                >
                  {isUploading ? "Processing" : "Upload"}
                </Button>
                <p className="text-xs text-gray-600 mt-1">Images/PDFs (64MB)</p>
              </div>
            </div>
            <UploadButton
              className=" ut-button:w-full ut-button:text-sm ut-button:mx-0 ut-button:h-9 ut-button:rounded-md ut-button:px-2 ut-button:py-2 ut-button:font-normal ut-button:ring-0"
              endpoint="videoUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]?.url) {
                  updateDraftField(postId, "downloadUrl", res[0].url);
                }
                toast.success("File uploaded sucessfully.");
                window.location.reload();
              }}
              onUploadError={(error: Error) => {
                toast.error(`${error.message}`);
              }}
            />
          </DialogContent>
        </Dialog>

        <TooltipContent>
          <p>Files</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FileAttachmentButton;

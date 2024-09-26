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
import { Paperclip } from "lucide-react";
import { updateDraftField } from "@/actions/draft";
import { toast } from "sonner";
import { getLinkedInId } from "@/actions/user";
import LinkedInConnect from "../global/connect-linkedin";
import { usePostStore } from "@/store/post";

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
    <>
      {showLinkedInConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <LinkedInConnect />
        </div>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent aria-description="Upload" aria-describedby={"Upload"}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Attach File
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-3 py-4">
            <div>
              <Input
                id="file-upload"
                type="file"
                className="mb-1"
                onChange={handleFileChange}
                accept="image/jpeg,image/gif,image/png,image/heic,image/heif,image/webp,image/bmp,image/tiff,.pdf,.pptx,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,video/x-ms-asf,audio/mpeg,video/mpeg"
              />

              <span className="text-sm text-muted-foreground">
                <span className="font-medium">NOTE:</span> Video Uploads are
                limited to 50 MB as of now.
              </span>
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Selected file: </span>
                  {selectedFile.name}
                </p>
              )}
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
            <Button
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
              {isUploading ? "Processing" : "Attach"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileAttachmentButton;

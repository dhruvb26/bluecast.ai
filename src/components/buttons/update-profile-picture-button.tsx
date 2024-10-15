"use client";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";

export default function UpdateProfilePictureButton() {
  return (
    <UploadButton
      className="ut-allowed-content:hidden ut-button:w-full ut-button:text-sm ut-button:mx-0 ut-button:h-9 ut-button:rounded-md ut-button:px-2 ut-button:py-2 ut-button:font-normal ut-button:ring-0"
      endpoint="profilePictureUploader"
      onClientUploadComplete={(res) => {
        toast.success("File uploaded sucessfully.");
        window.location.reload();
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error.message}`);
      }}
    />
  );
}

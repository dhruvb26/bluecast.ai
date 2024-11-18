"use client";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { updateUserImage } from "@/actions/user";
import { useUser } from "@clerk/nextjs";

export default function UpdateProfilePictureButton() {
  const { user } = useUser();

  return (
    <UploadButton
      className="ut-allowed-content:hidden ut-button:hover:bg-primary/90 ut-button:w-full ut-button:text-sm ut-button:mx-0 ut-button:h-9 ut-button:rounded-md ut-button:px-2 ut-button:py-2 ut-button:font-normal ut-button:ring-0"
      endpoint="profilePictureUploader"
      onClientUploadComplete={(res) => {
        if (!user) {
          toast.error("No user found");
          return;
        }

        updateUserImage(user.id, res[0].url)
          .then(() => {
            toast.success("Profile picture updated successfully");
            window.location.reload();
          })
          .catch((error) => {
            toast.error("Failed to update profile picture");
            console.error(error);
          });
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error.message}`);
      }}
    />
  );
}

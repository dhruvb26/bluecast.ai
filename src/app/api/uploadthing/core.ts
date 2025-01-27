import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { checkAccess, getUser, updateUserImage } from "@/actions/user";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  audioUploader: f({ audio: { maxFileSize: "64MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await getUser();

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, uploadedUrl: file.url };
    }),
  pdfUploader: f({ pdf: { maxFileSize: "64MB" } })
    .middleware(async ({ req }) => {
      const user = await getUser();

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("PDF upload complete for userId:", metadata.userId);
      console.log("PDF file url", file.url);

      return { uploadedBy: metadata.userId, uploadedUrl: file.url };
    }),
  videoUploader: f({ "video/mp4": { maxFileSize: "128MB" } })
    .middleware(async ({ req }) => {
      await checkAccess();
      const user = await getUser();

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, uploadedUrl: file.url };
    }),
  profilePictureUploader: f({ image: { maxFileSize: "128MB" } })
    .middleware(async ({ req }) => {
      await checkAccess();
      const user = await getUser();

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, uploadedUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

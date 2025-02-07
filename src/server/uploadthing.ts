import { env } from "@/env";
import { UTApi } from "uploadthing/server";
export const utapi = new UTApi({
  apiKey: env.UPLOADTHING_SECRET,
});

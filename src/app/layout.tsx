import "@/styles/globals.css";
import "@uploadthing/react/styles.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PHProvider } from "./providers";
import FeedbackButton from "@/components/buttons/feedback-button";
import dynamic from "next/dynamic";
import * as Frigade from "@frigade/react";
import { env } from "@/env";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

const PostHogPageView = dynamic(() => import("./PostHogPageView"), {
  ssr: false,
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Bluecast - LinkedIn Growth Made Easy",
  description: "Growing on LinkedIn made easy.",
  icons: [{ rel: "icon", url: "/brand/favicon.png" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  const user = await currentUser();
  return (
    <ClerkProvider afterSignOutUrl={"https://www.bluecast.ai/"}>
      <Frigade.Provider
        apiKey={env.FRIGADE_API_KEY}
        userId={userId || ""}
        userProperties={{
          name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
          id: userId,
        }}
      >
        <html lang="en" className={`${inter.className}`}>
          <PHProvider>
            <body>
              <PostHogPageView />
              {children}
              <FeedbackButton />
              <Toaster position="bottom-right" />
            </body>
          </PHProvider>
        </html>
      </Frigade.Provider>
    </ClerkProvider>
  );
}

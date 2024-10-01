import "@/styles/globals.css";
import "@uploadthing/react/styles.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PHProvider } from "./providers";
import FeedbackButton from "@/components/buttons/feedback-button";
import dynamic from "next/dynamic";

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
  return (
    <ClerkProvider afterSignOutUrl={"https://www.bluecast.ai/"}>
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
    </ClerkProvider>
  );
}

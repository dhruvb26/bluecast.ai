import "@/styles/globals.css";
import "@uploadthing/react/styles.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PHProvider } from "./providers";
import dynamic from "next/dynamic";
import * as Frigade from "@frigade/react";
import { env } from "@/env";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import SuccessIcon from "@/components/icons/success-icon";
import ErrorIcon from "@/components/icons/error-icon";
import InfoIcon from "@/components/icons/info-icon";

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
              <Toaster
                className="ml-0 mr-0"
                position="top-right"
                offset={32}
                toastOptions={{
                  unstyled: true,
                  classNames: {
                    toast:
                      "flex flex-row mt-6 justify-start space-x-5 border border-input items-center w-full p-4 text-gray-900 bg-white rounded-md shadow-sm",
                    title: "text-sm font-normal",
                  },
                }}
                icons={{
                  success: <SuccessIcon />,
                  error: <ErrorIcon />,
                  info: <InfoIcon />,
                }}
              />
            </body>
          </PHProvider>
        </html>
      </Frigade.Provider>
    </ClerkProvider>
  );
}

import "@/styles/globals.css";
import "@uploadthing/react/styles.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { PHProvider } from "./providers";
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
  const FRIGADE_THEME_OVERRIDES = {
    colors: {
      primary: {
        border: "#ffffff",
        focus: {
          border: "none",
        },
        hover: {
          border: "none",
        },
      },
      secondary: {
        border: "#eaecf0",
      },
    },
  };

  return (
    <ClerkProvider afterSignOutUrl={"https://www.bluecast.ai/"}>
      {/* // <Frigade.Provider
    //   theme={FRIGADE_THEME_OVERRIDES}
    //   apiKey="api_public_M7QhrYdEIODS2CMpemUNO3jTudHN7yrVCuHQSHzplE0d21HHYVzEdT18GMjtQM7d"
    //   userId={user?.id}
    //   userProperties={{
    //     name: user?.name,
    //     email: user?.email,
    //     id: user?.id,
    //     account: !!user,
    //     preferences: !!user?.onboardingData,
    //   }}
    // > */}

      <html lang="en" className={`${inter.className}`}>
        <PHProvider>
          <body>
            <PostHogPageView />
            {children}
            <Toaster position="bottom-right" />
          </body>
        </PHProvider>
      </html>
    </ClerkProvider>
  );
}

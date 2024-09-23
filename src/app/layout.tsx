import "@/styles/globals.css";
import "@uploadthing/react/styles.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Spireo - LinkedIn Growth Made Easy",
  description: "Growing on LinkedIn made easy.",
  icons: [{ rel: "icon", url: "/brand/icon.png" }],
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
        <body>
          {children}
          <Toaster position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}

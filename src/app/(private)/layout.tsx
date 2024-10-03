import { Suspense } from "react";
import Sidebar from "@/components/global/sidebar";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import TourVideoAnnouncement from "@/components/frigade/tour-video-announcement";
const routerConfig = extractRouterConfig(ourFileRouter);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Suspense>
        <Sidebar>
          <main className="max-w-screen w-full">
            <NextSSRPlugin routerConfig={routerConfig} />
            <TourVideoAnnouncement />
            {children}
          </main>
        </Sidebar>
      </Suspense>
    </div>
  );
}

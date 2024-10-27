import { Suspense } from "react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import TourVideoAnnouncement from "@/components/frigade/tour-video-announcement";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";
const routerConfig = extractRouterConfig(ourFileRouter);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <SidebarProvider>
        <div className="flex flex-col h-screen">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <NextSSRPlugin routerConfig={routerConfig} />
              <TourVideoAnnouncement />
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </Suspense>
  );
}

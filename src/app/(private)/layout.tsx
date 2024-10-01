import { Suspense } from "react";
import Sidebar from "@/components/global/sidebar";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";

import { extractRouterConfig } from "uploadthing/server";
// Import the router config
import { ourFileRouter } from "@/app/api/uploadthing/core";

// Extract the router config outside of the component
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
            {children}
          </main>
        </Sidebar>
      </Suspense>
    </div>
  );
}

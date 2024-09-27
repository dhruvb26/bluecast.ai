"use client";
import { Suspense } from "react";
import Sidebar from "@/components/global/sidebar";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { extractRouterConfig } from "uploadthing/server";

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
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            {children}
          </main>
        </Sidebar>
      </Suspense>
    </div>
  );
}

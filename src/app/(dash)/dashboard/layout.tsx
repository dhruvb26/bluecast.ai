// import Sidebar from "@/components/sidebar";
import { Suspense } from "react";
import Sidebar from "@/components/global/sidebar";
import { getServerAuthSession } from "@/server/auth";
import { getUser } from "@/actions/user";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { extractRouterConfig } from "uploadthing/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  const user = await getUser();
  return (
    <div className="flex min-h-screen">
      <Suspense>
        <Sidebar session={session} user={user}>
          <main className="max-w-screen w-full p-8">
            <NextSSRPlugin
              /**
               * The `extractRouterConfig` will extract **only** the route configs
               * from the router to prevent additional information from being
               * leaked to the client. The data passed to the client is the same
               * as if you were to fetch `/api/uploadthing` directly.
               */
              routerConfig={extractRouterConfig(ourFileRouter)}
            />
            {children}
            {/* <FeedbackButton /> */}
          </main>
        </Sidebar>
      </Suspense>
    </div>
  );
}

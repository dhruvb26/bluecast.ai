import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserAccessInWorkspace } from "@/actions/workspace";
export default async function PricingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionClaims } = auth();
  const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
    | string
    | undefined;

  if (workspaceId) {
    const result = await getUserAccessInWorkspace();

    if (result.success) {
      const role = result.data;
      if (role !== "org:admin") {
        return redirect("/settings");
      }
    }
  }

  return <>{children}</>;
}

import { auth } from "@clerk/nextjs/server";
import { ReactNode } from "react";
import { db } from "@/server/db";
import { eq, and } from "drizzle-orm";
import { workspaceMembers } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { ErrorToast } from "./error-toast";
interface WorkspaceSettingsLayoutProps {
  children: ReactNode;
  params: {
    workspaceId: string;
  };
}

export default async function WorkspaceSettingsLayout({
  children,
  params,
}: WorkspaceSettingsLayoutProps) {
  const { sessionClaims, userId } = auth();

  const workspaceId = sessionClaims?.metadata?.activeWorkspaceId;

  if (!workspaceId) {
    return <>{children}</>;
  }

  // const workspaceMember = await db.query.workspaceMembers.findFirst({
  //   where: and(
  //     eq(workspaceMembers.workspaceId, workspaceId as string),
  //     eq(workspaceMembers.userId, userId as string)
  //   ),
  // });

  // const role = workspaceMember?.role;

  // if (role !== "org:admin") {
  //   return <ErrorToast />;
  // }

  return <>{children}</>;
}

"use client";

import { ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@clerk/nextjs";
import { getActiveWorkspaceId, getWorkspace } from "@/actions/workspace";
import { useEffect, useState } from "react";

export function NavUser({ user }: { user: any }) {
  const { isMobile } = useSidebar();
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const activeWorkspaceId = await getActiveWorkspaceId();
      if (activeWorkspaceId) {
        const workspaceResponse = await getWorkspace(activeWorkspaceId);
        if (workspaceResponse.success) {
          setWorkspace(workspaceResponse.data);
        }
      }
      setIsLoading(false);
    };

    fetchWorkspace();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 h-[48px]">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const displayName = workspace
    ? workspace.linkedInName || user.name
    : user.name;
  const displayImage = workspace
    ? workspace.linkedInImageUrl || ""
    : user.image;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
            asChild
          >
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={displayImage} alt={displayName} />
                <AvatarFallback className="rounded-full">
                  {displayName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-foreground font-semibold tracking-tight">
                  {displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {workspace ? "" : user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={displayImage} alt={displayName} />
                  <AvatarFallback className="rounded-lg text-muted-foreground">
                    {displayName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-foreground font-semibold tracking-tight">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {workspace ? "" : user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <SignOutButton redirectUrl="https://bluecast.ai/">
                <p className="text-sm">Logout</p>
              </SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

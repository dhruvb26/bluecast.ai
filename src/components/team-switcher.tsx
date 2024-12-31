"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useOrganizationList, useOrganization } from "@clerk/nextjs";
import { StackSimple } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { migrateToDefaultWorkspace, User } from "@/actions/user";
import { useEffect } from "react";
import { getWorkspaceMemberships, switchWorkspace } from "@/actions/workspace";
import { getWorkspaces } from "@/actions/workspace";
interface TeamSwitcherProps {
  user: User | null;
  teams: {
    id: string | null;
    name: string;
    plan: string;
  }[];
  loading: boolean;
}

export function TeamSwitcher({ user, teams, loading }: TeamSwitcherProps) {
  const router = useRouter();
  const { isMobile, state } = useSidebar();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const { organization } = useOrganization();
  const [workspaceCount, setWorkspaceCount] = React.useState(0);

  React.useEffect(() => {
    const fetchWorkspaces = async () => {
      const response = await getWorkspaceMemberships();
      setWorkspaceCount(response);
      console.log(response);
    };
    fetchWorkspaces();
  }, []);

  if (!isLoaded) {
    return null;
  }

  const handleOrganizationSwitch = async (orgId: string) => {
    await setActive({ organization: orgId });
    await switchWorkspace(orgId);
    window.location.reload();
  };

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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-md"
            >
              <div
                className={`flex items-center ${
                  state === "collapsed" ? "justify-center" : "justify-start"
                } w-full`}
              >
                <Image
                  priority
                  src="/brand/Bluecast Symbol.png"
                  alt="Bluecast"
                  width={24}
                  height={24}
                  className="hover:bg-white focus:bg-white transition-all"
                />
                {state !== "collapsed" && (
                  <>
                    <div className="ml-2 grid flex-1 text-left items-end text-sm leading-tight">
                      <Image
                        priority
                        src="/brand/Name.png"
                        alt="Bluecast"
                        width={90}
                        height={30}
                        className="w-25 h-7 object-contain"
                      />
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </>
                )}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md shadow-sm"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {workspaceCount === 0 && (
              <DropdownMenuItem
                onClick={() => handleOrganizationSwitch("")}
                className={`text-muted-foreground flex items-center ${
                  !organization?.id
                    ? "font-medium text-foreground bg-accent"
                    : "font-normal text-muted-foreground"
                }`}
              >
                <StackSimple
                  weight={!organization?.id ? "fill" : "duotone"}
                  className={`mr-2 ${
                    !organization?.id
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }`}
                  size={16}
                />
                Default
              </DropdownMenuItem>
            )}
            {userMemberships.data?.map((mem) => (
              <DropdownMenuItem
                key={mem.id}
                onClick={() => handleOrganizationSwitch(mem.organization.id)}
                className={`text-muted-foreground flex items-center ${
                  organization?.id === mem.organization.id
                    ? "font-medium text-foreground bg-accent"
                    : "font-normal text-muted-foreground"
                }`}
              >
                <StackSimple
                  weight={
                    organization?.id === mem.organization.id
                      ? "fill"
                      : "duotone"
                  }
                  className={`mr-2 ${
                    organization?.id === mem.organization.id
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }`}
                  size={16}
                />
                {mem.organization.name}
              </DropdownMenuItem>
            ))}
            {userMemberships.hasNextPage && (
              <DropdownMenuItem
                onClick={() => userMemberships.fetchNext()}
                className="text-muted-foreground flex items-center"
              >
                <StackSimple
                  weight="duotone"
                  className="mr-2 text-muted-foreground"
                  size={16}
                />
                Load More
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/settings/workspace")}
              className="focus:bg-accent transition-all"
            >
              Manage Workspaces
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

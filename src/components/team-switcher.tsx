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
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { HourglassSimpleHigh } from "@phosphor-icons/react";
export function TeamSwitcher({
  teams,
  loading = false,
}: {
  teams: {
    name: string;
    logo: React.ReactNode;
    plan: string;
  }[];
  loading?: boolean;
}) {
  const { isMobile, state } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

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
                    <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
                      <Image
                        priority
                        src="/brand/Name.png"
                        alt="Bluecast"
                        width={80}
                        height={20}
                        className="w-20 h-5 object-contain"
                      />
                      <span className="truncate text-xs text-muted-foreground">
                        {loading ? (
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        ) : (
                          activeTeam.plan
                        )}
                      </span>
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
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
              >
                <div className="flex items-center">
                  {team.logo}
                  {team.name}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled
              className="focus:bg-blue-600 transition-all focus:text-white flex justify-between items-center"
            >
              <div className="flex items-center opacity-50">
                <Plus className="inline mr-1" size={16} />
                Add
              </div>
              <Badge className="opacity-80 font-normal text-xs text-indigo-600 bg-indigo-100">
                <HourglassSimpleHigh
                  weight="fill"
                  className="inline mr-1 w-3 h-3"
                />
                Soon
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

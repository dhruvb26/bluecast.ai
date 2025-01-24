"use client";

import { usePathname, useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { PenSquare } from "lucide-react";
import { HourglassSimpleHigh, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveDraft } from "@/actions/draft";
import { Badge } from "@/components/ui/badge";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import House from "./icons/house";
import HouseOutline from "./icons/house-outline";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavCreate({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    activeIcon: React.ReactNode;
    inactiveIcon: React.ReactNode;
    comingSoon?: boolean;
  }[];
}) {
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const pathname = usePathname();
  const router = useRouter();

  const renderMenuItem = (item: (typeof projects)[0]) => {
    const isActive = pathname === item.url;
    return (
      <SidebarMenuItem
        key={item.name}
        className={`${isActive ? "bg-sidebar-accent rounded-md" : ""}`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild>
              <a href={item.url} className={`flex items-center`}>
                {isActive ? item.activeIcon : item.inactiveIcon}
                {!isCollapsed && (
                  <span
                    className={`text-sm ${
                      isActive ? "font-medium text-black " : "font-normal "
                    }`}
                  >
                    {item.name}
                  </span>
                )}
                {"comingSoon" in item && item.comingSoon && !isCollapsed && (
                  <Badge className="ml-1 opacity-80 font-normal text-xs hover:bg-indigo-100 text-indigo-600 hover:text-indigo-600 bg-indigo-100">
                    <Sparkle weight="duotone" className="inline w-3 h-3" />
                    New
                  </Badge>
                )}
              </a>
            </SidebarMenuButton>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="z-50">
              <p>{item.name}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  const handleCreateDraft = async () => {
    const id = uuid();
    await saveDraft(id, "");
    router.push(`/draft/${id}`);
  };

  return (
    <>
      <SidebarGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className={cn(
                "w-full rounded-md bg-gradient-to-r to-brand-blue-secondary from-brand-blue-primary hover:from-blue-500 hover:to-blue-500 hover:via-blue-500 border border-blue-500 text-white shadow-none hover:shadow-sm transition-all duration-300 flex items-center justify-center",
                isCollapsed ? "px-2" : "px-5"
              )}
              onClick={handleCreateDraft}
            >
              <PenSquare size={18} className={isCollapsed ? "" : "mx-1.5"} />
              {!isCollapsed && "Write Post"}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="z-50">
              <p>Write Post</p>
            </TooltipContent>
          )}
        </Tooltip>
        {/* <SidebarMenu>{menuItems.map(renderMenuItem)}</SidebarMenu> */}
      </SidebarGroup>
      <SidebarGroup>
        {!isCollapsed && (
          <SidebarGroupLabel className="text-xs text-gray-600">
            Create
          </SidebarGroupLabel>
        )}
        <SidebarMenu>
          {projects.map((item) => renderMenuItem(item))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

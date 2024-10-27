"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Menu } from "lucide-react";
import { User } from "@/actions/user";

export function NavFooter({
  footerItems,
  user,
}: {
  footerItems: {
    name: string;
    url: string;
    icon: React.ReactNode;
  }[];
  user: User;
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const renderMenuItem = (item: (typeof footerItems)[0]) => {
    return (
      <SidebarMenuItem key={item.name}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild>
              <Link target="_blank" href={item.url}>
                {item.icon}
                {!isCollapsed && (
                  <span className="text-sm font-normal">{item.name}</span>
                )}
              </Link>
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

  return (
    <SidebarGroup>
      {/* {!isCollapsed && (
        <div className="px-3 py-2 flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Press ⌘ + B to toggle
          </p>
        </div>
      )} */}

      <SidebarMenu>
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton asChild>
                <Link
                  className="hover:cursor-default"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  <Menu />
                  {!isCollapsed && (
                    <span className="text-sm font-normal">Usage</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </TooltipTrigger>

            <TooltipContent side="right" className="z-50 p-3">
              <div className="w-48 space-y-2">
                <div className="flex flex-col">
                  <span className="text-xs text-foreground">
                    {user.specialAccess
                      ? `${user.generatedPosts || 0} / 10 posts`
                      : `${user.generatedWords || 0} / 50000 words`}
                  </span>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
                      style={{
                        width: `${
                          user.specialAccess
                            ? ((user.generatedPosts || 0) / 10) * 100
                            : ((user.generatedWords || 0) / 50000) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.specialAccess
                    ? user.generatedPosts >= 10
                      ? "You've hit the limit. Upgrade your plan for more content generation."
                      : "This trial allows you to generate 10 posts as of now."
                    : "This plan allows you to generate 50k words monthly as of now."}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
        {footerItems.map(renderMenuItem)}
      </SidebarMenu>
    </SidebarGroup>
  );
}

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
import { SignOutButton } from "@clerk/nextjs";

export function NavFooter({
  footerItems,
}: {
  footerItems: {
    name: string;
    url: string;
    icon: React.ReactNode;
  }[];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const renderMenuItem = (
    item: (typeof footerItems)[0],
    isSignOut?: boolean
  ) => {
    return (
      <SidebarMenuItem key={item.name}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton className="hover:cursor-pointer" asChild>
              {isSignOut ? (
                <SignOutButton redirectUrl={item.url}>
                  <div className="flex items-center gap-2 w-full">
                    {item.icon}
                    {!isCollapsed && (
                      <span className="text-sm font-normal">{item.name}</span>
                    )}
                  </div>
                </SignOutButton>
              ) : (
                <Link target="_blank" href={item.url}>
                  {item.icon}
                  {!isCollapsed && (
                    <span className="text-sm font-normal">{item.name}</span>
                  )}
                </Link>
              )}
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
      <SidebarMenu>
        {footerItems.map((item, index) => renderMenuItem(item, index === 0))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

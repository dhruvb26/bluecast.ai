"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    activeIcon?: React.ReactNode;
    inactiveIcon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs text-gray-600">
        Manage
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, index) => {
          const isActive = item.items
            ? item.items.some((subItem) => pathname.includes(subItem.url))
            : pathname.includes(item.url);

          if (index === 0 && item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={
                        isActive
                          ? "font-medium text-foreground bg-sidebar-accent"
                          : ""
                      }
                    >
                      {isActive ? item.activeIcon : item.inactiveIcon}
                      {!isCollapsed && (
                        <span
                          className={`text-sm ${
                            isActive
                              ? "font-medium text-foreground"
                              : "font-normal"
                          }`}
                        >
                          {item.title}
                        </span>
                      )}
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mt-2">
                      {item.items.map((subItem) => {
                        const isSubItemActive = pathname.includes(subItem.url);
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              className={`py-4 ${
                                isSubItemActive
                                  ? "font-medium text-foreground bg-none"
                                  : ""
                              }`}
                              asChild
                            >
                              <Link href={subItem.url}>
                                <span
                                  className={`text-sm ${
                                    isSubItemActive
                                      ? "font-medium text-foreground"
                                      : "font-normal"
                                  }`}
                                >
                                  {subItem.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          } else {
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={isActive ? "bg-sidebar-accent rounded-md" : ""}
                  >
                    {isActive ? item.activeIcon : item.inactiveIcon}
                    {!isCollapsed && (
                      <span
                        className={`text-sm ${
                          isActive
                            ? "font-medium text-foreground"
                            : "font-normal"
                        }`}
                      >
                        {item.title}
                      </span>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          }
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

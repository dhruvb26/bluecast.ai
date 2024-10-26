import {
  SidebarGroup,
  SidebarGroupLabel,
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
      {!isCollapsed && (
        <div className="px-3 py-2 flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Press ⌘ + B to toggle
          </p>
        </div>
      )}
      <SidebarMenu>{footerItems.map(renderMenuItem)}</SidebarMenu>
    </SidebarGroup>
  );
}

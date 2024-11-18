"use client";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import Lightbulb from "./icons/lightbulb-3";
import Lightbulb3Outline from "./icons/lightbulb-3-outline";
import { NavCreate } from "@/components/nav-create";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import GridCirclePlus from "./icons/grid-circle-plus";
import ChartBarTrendUp from "./icons/chart-bar-trend-up";
import GridCirclePlusOutline from "./icons/grid-circle-plus-outline";
import ChartBarTrendUpOutline from "./icons/chart-bar-trend-up-outline";
import CalendarDays from "./icons/calendar-days";
import CalendarDaysOutline from "./icons/calendar-days-outline";
import BoxArchive from "./icons/box-archive";
import BoxArchiveOutline from "./icons/box-archive-outline";
import Sliders from "./icons/sliders";
import SlidersOutline from "./icons/sliders-outline";
import GearOutline from "./icons/gear-outline";
import Gear from "./icons/gear";
import { getUser } from "@/actions/user";
import { getPlanType } from "@/utils/plan";
import { NavFooter } from "./nav-footer";
import { User } from "@/actions/user";
import MsgBubbleUser from "./icons/msg-bubble-user";
import Rocket from "./icons/rocket";
import RocketOutline from "./icons/rocket-outline";
import { StackSimple } from "@phosphor-icons/react";
import { getWorkspaces } from "@/actions/workspace";

const data = {
  teams: [
    {
      name: "Default",
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Saved",
      url: "#",
      activeIcon: <BoxArchive className="text-blue-600" />,
      inactiveIcon: <BoxArchiveOutline />,
      isActive: true,
      items: [
        {
          title: "Posts",
          url: "/saved/posts",
        },
        {
          title: "Ideas",
          url: "/saved/ideas",
        },
        {
          title: "Creator Lists",
          url: "/saved/lists",
        },
        {
          title: "Writing Styles",
          url: "/saved/styles",
        },
      ],
    },

    {
      title: "Preferences",
      url: "/preferences",
      activeIcon: <Sliders className="text-blue-600" />,
      inactiveIcon: <SlidersOutline />,
    },
    {
      title: "Settings",
      url: "/settings",
      activeIcon: <Gear className="text-blue-600" />,
      inactiveIcon: <GearOutline />,
    },
  ],
  footer: [
    {
      name: "Feedback",
      url: "https://bluecast.canny.io/feedback",
      icon: <MsgBubbleUser />,
    },
  ],
  create: [
    {
      name: "Post Templates",
      url: "/create/posts",

      activeIcon: <GridCirclePlus className="text-blue-600" />,
      inactiveIcon: <GridCirclePlusOutline />,
    },
    {
      name: "Ideas Generator",
      url: "/create/ideas",
      activeIcon: <Lightbulb className="text-blue-600" />,
      inactiveIcon: <Lightbulb3Outline />,
    },
    {
      name: "Inspiration ",
      url: "/create/inspiration",
      activeIcon: <ChartBarTrendUp className="text-blue-600" />,
      inactiveIcon: <ChartBarTrendUpOutline />,
    },
    {
      name: "Posts For You",
      url: "/create/for-you",
      activeIcon: <Rocket className="text-blue-600" />,
      inactiveIcon: <RocketOutline />,
      comingSoon: true,
    },
    {
      name: "Content Scheduler",
      url: "/schedule",
      activeIcon: <CalendarDays className="text-blue-600" />,
      inactiveIcon: <CalendarDaysOutline />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [workspaces, setWorkspaces] = useState<
    { id: string | null; name: string; plan: string }[]
  >([
    {
      id: null,
      name: "Default",
      plan: "",
    },
  ]);

  useEffect(() => {
    const fetchUserAndWorkspaces = async () => {
      try {
        const userData = await getUser();
        setUser(userData);

        const workspacesResponse = await getWorkspaces();
        if (workspacesResponse.success && workspacesResponse.data) {
          const defaultWorkspace = {
            id: null,
            name: "Default",
            plan: getPlanType(userData.priceId),
          };

          const formattedWorkspaces = workspacesResponse.data.map(
            (workspace) => ({
              id: workspace.id,
              name: workspace.name,
              plan: getPlanType(userData.priceId),
            })
          );

          setWorkspaces([defaultWorkspace, ...formattedWorkspaces]);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching user or workspaces:", error);
        setIsLoaded(true);
      }
    };

    fetchUserAndWorkspaces();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher user={user} teams={workspaces} loading={!isLoaded} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavCreate projects={data.create} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <NavFooter user={user} footerItems={data.footer} />
      <SidebarFooter>
        {isLoaded && user ? (
          <NavUser user={user} />
        ) : (
          <div className="flex items-center gap-2 p-2 h-[48px]">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

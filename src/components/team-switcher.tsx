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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  createWorkspace,
  getActiveWorkspaceId,
  switchWorkspace,
} from "@/actions/workspace";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  HourglassSimpleHigh,
  Sparkle,
  StackSimple,
} from "@phosphor-icons/react";
import { Badge } from "./ui/badge";

export function TeamSwitcher({
  teams,
  loading = false,
  user,
}: {
  teams: {
    id: string | null;
    name: string;
    plan: string;
  }[];
  loading?: boolean;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
}) {
  const router = useRouter();
  const { isMobile, state } = useSidebar();
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = React.useState(false);
  const [activeWorkspace, setActiveWorkspaceState] = React.useState<
    (typeof teams)[0] | null
  >(null);

  // Set default workspace if none is active
  React.useEffect(() => {
    const initWorkspace = async () => {
      const activeId = await getActiveWorkspaceId();
      if (!activeId && teams.length > 0) {
        setActiveWorkspaceState(teams[0]);
        await switchWorkspace(teams[0].id!);

        console.log("Selected workspace ID:", teams[0].id);
      } else if (activeId) {
        const activeTeam = teams.find((team) => team.id === activeId);
        if (activeTeam) {
          setActiveWorkspaceState(activeTeam);
        }
      }
    };
    initWorkspace();
  }, [teams]);

  const handleWorkspaceChange = async (workspace: (typeof teams)[0]) => {
    // Check if current URL contains /draft/
    if (window.location.pathname.includes("/draft/")) {
      toast.error("Cannot switch workspace while editing a draft");
      return;
    }

    const response = await switchWorkspace(workspace.id!);
    if (!response?.success) {
      toast.error("Failed to switch workspace");
      return;
    }

    window.location.reload();
    console.log("Selected workspace ID:", workspace.id);
  };

  const handleCreateWorkspace = async () => {
    try {
      setIsCreatingWorkspace(true);
      const response = await createWorkspace(workspaceName);
      if (!response.success) {
        throw new Error(response.error);
      }
      toast.success("Workspace created successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create workspace"
      );
    } finally {
      setIsCreatingWorkspace(false);
      setWorkspaceName("");
    }
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
                          activeWorkspace?.plan
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
                onClick={() => handleWorkspaceChange(team)}
                className={
                  activeWorkspace?.name === team.name
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                <div className="flex items-center">
                  {activeWorkspace?.name === team.name ? (
                    <StackSimple
                      weight="fill"
                      className="mr-2 text-blue-600"
                      size={16}
                    />
                  ) : (
                    <StackSimple
                      weight="duotone"
                      className="mr-2 text-muted-foreground"
                      size={16}
                    />
                  )}
                  {team.name}
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="focus:bg-accent  transition-all  flex justify-between items-center"
                >
                  <div className="flex items-center ">
                    <Plus className="inline mr-1" size={16} />
                    Add Workspace
                  </div>
                  <Badge className="opacity-80 font-normal text-xs text-indigo-600 bg-indigo-100">
                    <Sparkle weight="duotone" className="inline mr-1 w-3 h-3" />
                    New
                  </Badge>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Workspace</DialogTitle>
                  <DialogDescription>
                    Add a new workspace to organize your content.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Workspace name</Label>
                    <Input
                      id="name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="Enter workspace name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>

                  <Button
                    loading={isCreatingWorkspace}
                    onClick={handleCreateWorkspace}
                    type="submit"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

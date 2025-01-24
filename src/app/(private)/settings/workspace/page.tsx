"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWorkspace, getWorkspaces } from "@/actions/workspace";
import { toast } from "sonner";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";

export default function WorkspacePage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await getWorkspaces();
      if (response?.success && Array.isArray(response.data)) {
        setWorkspaces(response.data);
      } else {
        setWorkspaces([]);
        toast.error("Failed to fetch workspaces");
      }
    } catch (error) {
      setWorkspaces([]);
      toast.error("An error occurred while fetching workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await createWorkspace(newWorkspaceName);
      if (response.success) {
        toast.success("Workspace created successfully");
        window.location.reload();
        setNewWorkspaceName("");
        fetchWorkspaces();
      } else {
        toast.error(response.error || "Failed to create workspace");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleManageWorkspace = (workspaceId: string) => {
    if (organization?.id !== workspaceId) {
      toast.error("Please switch to the correct workspace before managing it.");
      return;
    }
    router.push(`/settings/workspace/${workspaceId}`);
  };

  return (
    <main className="p-8">
      <div className="space-y-10">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your workspaces
          </p>
        </div>

        <form onSubmit={handleCreateWorkspace} className="flex gap-2 w-full">
          <Input
            placeholder="Enter Workspace Name"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
          />
          <Button type="submit" disabled={isCreating}>
            Create
          </Button>
        </form>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.length > 0 &&
            workspaces.map((workspace) => (
              <Card key={workspace.id}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold tracking-tight">
                    {workspace.name}
                  </CardTitle>
                  <CardDescription className="flex justify-between items-center">
                    <span>
                      Created at{" "}
                      {new Date(workspace.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageWorkspace(workspace.id)}
                    >
                      Manage
                    </Button>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
        </div>

        {!isLoading && workspaces.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No workspaces found. Create your first workspace above.
          </p>
        )}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <BarLoader color="#2563eb" height={3} width={300} />
          </div>
        )}
      </div>
    </main>
  );
}

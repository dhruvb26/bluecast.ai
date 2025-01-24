"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "@/actions/workspace";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getActiveWorkspace } from "@/actions/user";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = React.useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const activeWorkspace = await getActiveWorkspace();
      if (activeWorkspace) {
        setWorkspaceName(activeWorkspace.name);
        setActiveWorkspaceId(activeWorkspace.id);
      }
    };
    fetchWorkspace();
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      let response;

      if (activeWorkspaceId) {
        response = await updateWorkspace(activeWorkspaceId, workspaceName);
      } else {
        response = await createWorkspace(workspaceName);
      }

      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success(
        activeWorkspaceId
          ? "Workspace updated successfully"
          : "Workspace created successfully"
      );
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save workspace"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeWorkspaceId) return;

    try {
      setIsLoading(true);
      const response = await deleteWorkspace(activeWorkspaceId);

      if (!response.success) {
        throw new Error(response.error);
      }

      toast.success("Workspace deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete workspace"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8">
      <div className="mb-8 text-left">
        <h1 className="text-lg tracking-tight font-semibold text-foreground">
          {activeWorkspaceId ? "Edit Workspace" : "Create Workspace"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {activeWorkspaceId
            ? "Edit or delete your workspace here. Switch between workspaces to manage your content."
            : "Create a new workspace to organize your content."}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Enter workspace name"
          />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            loading={isLoading}
            onClick={handleSave}
            disabled={!workspaceName}
          >
            {activeWorkspaceId ? "Update" : "Create"}
          </Button>
          {activeWorkspaceId && (
            <Button
              variant="destructive"
              loading={isLoading}
              onClick={handleDelete}
            >
              Delete Workspace
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

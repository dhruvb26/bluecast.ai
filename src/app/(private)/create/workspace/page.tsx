"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWorkspace } from "@/actions/workspace";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = React.useState(false);

  const handleCreateWorkspace = async () => {
    try {
      setIsCreatingWorkspace(true);
      const response = await createWorkspace(workspaceName);
      if (!response.success) {
        throw new Error(response.error);
      }
      toast.success("Workspace created successfully");
      window.location.reload();
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
    <main className="p-8">
      <div className="mb-8 text-left">
        <h1 className="text-lg tracking-tight font-semibold text-foreground">
          Create Workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a new workspace to organize your content.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Workspace name
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
            loading={isCreatingWorkspace}
            onClick={handleCreateWorkspace}
            disabled={!workspaceName}
          >
            Create Workspace
          </Button>
        </div>
      </div>
    </main>
  );
}

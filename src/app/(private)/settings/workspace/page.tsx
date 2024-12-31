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
import { useRouter } from "next/navigation";

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    const response = await getWorkspaces();
    if (response.success) {
      setWorkspaces(response.data);
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
          {workspaces.map((workspace) => (
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
                  <Link href={`/settings/workspace/${workspace.id}`}>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {workspaces.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No workspaces found. Create your first workspace above.
          </p>
        )}
      </div>
    </main>
  );
}

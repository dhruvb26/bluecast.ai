"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWorkspace } from "@/actions/workspace";

interface WorkspaceDialogProps {
  workspaceId: string;
  currentName: string;
}

export default function WorkspaceDialog({
  workspaceId,
  currentName,
}: WorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState(currentName);

  const handleUpdateWorkspace = async () => {
    if (!workspaceId) return;
    await updateWorkspace(workspaceId, workspaceName);
    window.location.reload();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Edit your workspace name here.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="text-sm"
          placeholder="Default"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpdateWorkspace}>
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

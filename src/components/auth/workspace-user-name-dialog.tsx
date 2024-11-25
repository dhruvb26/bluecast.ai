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
import { updateWorkspaceLinkedInName } from "@/actions/workspace";
import { toast } from "sonner";

interface WorkspaceUserNameDialogProps {
  workspaceId: string;
  currentLinkedInName: string;
}

export default function WorkspaceUserNameDialog({
  workspaceId,
  currentLinkedInName,
}: WorkspaceUserNameDialogProps) {
  const [linkedInName, setLinkedInName] = useState(currentLinkedInName);

  const handleUpdateLinkedInName = async () => {
    if (!workspaceId) return;
    await updateWorkspaceLinkedInName(workspaceId, linkedInName);
    toast.success("Display name updated");
    window.location.reload();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Display Name</AlertDialogTitle>
          <AlertDialogDescription>
            Edit your workspace display name here.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          type="text"
          value={linkedInName}
          onChange={(e) => setLinkedInName(e.target.value)}
          className="text-sm"
          placeholder="LinkedIn Display Name"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpdateLinkedInName}>
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

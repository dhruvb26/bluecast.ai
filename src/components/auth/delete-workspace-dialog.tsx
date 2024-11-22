"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { deleteWorkspace, switchWorkspace } from "@/actions/workspace";

interface DeleteWorkspaceDialogProps {
  workspaceId: string;
  workspaceName: string;
}

export default function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
}: DeleteWorkspaceDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDeleteWorkspace = async () => {
    if (confirmText !== "delete-workspace") {
      alert("Please type 'delete-workspace' to confirm workspace deletion.");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteWorkspace(workspaceId);
      await switchWorkspace("");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting workspace:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Remove</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold tracking-tight">
            Remove Workspace
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            This action cannot be undone. This will permanently delete your
            workspace "{workspaceName}" and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <p className="mb-2 text-sm">
            Type <strong>delete-workspace</strong> to confirm.
          </p>
          <Input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteWorkspace}
            disabled={isDeleting || confirmText !== "delete-workspace"}
          >
            {isDeleting ? "Processing" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

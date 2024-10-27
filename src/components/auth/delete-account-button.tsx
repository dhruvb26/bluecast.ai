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
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirmText !== "Delete account") {
      alert("Please type 'Delete account' to confirm account deletion.");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch("/api/clerk/delete", {
        method: "DELETE",
      });
      const result: any = await response.json();
      if (response.ok) {
        router.push("https://www.bluecast.ai/");
      } else {
        throw new Error(result.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Delete my account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold tracking-tight">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
            {/* <Link
              target="_blank"
              href="https://spireo.ai/deletion"
              className="ml-1 text-blue-500 hover:underline"
            >
              Learn more about account deletion here{" "}
              <ArrowUpRight className="inline h-4 w-4" />
            </Link> */}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <p className="mb-2 text-sm">
            Type <strong>Delete account</strong> to confirm.
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
            className=" bg-red-600 hover:bg-red-700"
            onClick={handleDeleteAccount}
            disabled={isDeleting || confirmText !== "Delete account"}
          >
            {isDeleting
              ? "We're sad to see you go..."
              : "Yes, delete my account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

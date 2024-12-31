"use client";

import { toast } from "sonner";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export const ErrorToast = () => {
  useEffect(() => {
    toast.error("You are not an admin of this workspace.");
    redirect("/settings");
  }, []);

  return null;
};

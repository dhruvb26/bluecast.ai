"use client";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { getUser } from "@/actions/user";
import Link from "next/link";
import { Clock, Timer } from "@phosphor-icons/react";

export default function Header() {
  const { state, isMobile } = useSidebar();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrialDays = async () => {
      try {
        const user = await getUser();
        if (user.trialEndsAt) {
          const now = new Date();
          const trialEnd = new Date(user.trialEndsAt);
          const daysLeft = Math.ceil(
            (trialEnd.getTime() - now.getTime()) / (1000 * 3600 * 24)
          );
          setTrialDaysLeft(Math.max(0, daysLeft));
        }
      } catch (error) {
        console.error("Error fetching trial days:", error);
      }
    };

    fetchTrialDays();
  }, []);

  return (
    <header className="w-screen h-10 bg-white border-b flex items-center justify-between px-4">
      <div className="flex items-center">
        {isMobile && <SidebarTrigger />}
        <span
          className={`text-lg font-semibold text-muted-foreground flex items-center ${
            !isMobile && (state === "expanded" ? "ml-[13.5rem]" : "ml-[2.5rem]")
          }`}
        >
          {!isMobile && <SidebarTrigger />}
        </span>
      </div>
      {trialDaysLeft !== null && (
        <Link href="/pricing">
          <div className="text-sm text-primary hidden sm:block">
            <Timer size={18} weight="duotone" className="inline mr-1" />
            Your trial ends in {trialDaysLeft} day
            {trialDaysLeft !== 1 ? "s" : ""}!
          </div>
        </Link>
      )}
    </header>
  );
}

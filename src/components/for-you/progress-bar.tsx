"use client";

import React from "react";
import { useEffect, useState } from "react";
import { getUser } from "@/actions/user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { User } from "@/actions/user";
import CircleInfo from "../icons/circle-info";

const ProgressBar = () => {
  const [refreshesUsed, setRefreshesUsed] = useState(0);
  const [maxRefreshes, setMaxRefreshes] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      const refreshes = Math.floor(user.forYouGeneratedPosts / 5);
      setRefreshesUsed(refreshes);
      setUser(user);

      // Set max refreshes based on subscription status
      if (!user.stripeSubscriptionId && !user.priceId) {
        setMaxRefreshes(1); // Free users get 1 refresh (5 posts)
      } else {
        setMaxRefreshes(4); // Paid users get 4 refreshes (20 posts)
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="w-full flex flex-col gap-y-2 my-4">
      <div className="flex items-center gap-x-1">
        <div className="flex items-center gap-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleInfo className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[250px] h-fit">
                <p className="text-sm">
                  {!user?.stripeSubscriptionId && !user?.priceId ? (
                    <span>
                      You have no refreshes on this trial.{" "}
                      <a
                        href="/pricing"
                        className="text-blue-600 underline hover:text-blue-700"
                      >
                        Upgrade
                      </a>{" "}
                      to get 4 refreshes per month!
                    </span>
                  ) : (
                    "You have 4 refreshes available this month. Usage resets at the start of each month. The usage is cumulative across all workspaces."
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {[...Array(maxRefreshes)].map((_, i) => (
          <div
            key={i}
            className={`w-full h-2 flex flex-col justify-center overflow-hidden rounded-full ${
              i < refreshesUsed
                ? "bg-blue-600 dark:bg-blue-500"
                : "bg-gray-300 dark:bg-neutral-600"
            } text-xs text-white text-center whitespace-nowrap transition duration-500`}
            role="progressbar"
            aria-valuenow={refreshesUsed}
            aria-valuemin={0}
            aria-valuemax={maxRefreshes}
          />
        ))}
        <div>
          <div className="text-start">
            <span className="text-sm text-muted-foreground dark:text-white">
              {refreshesUsed}/{maxRefreshes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

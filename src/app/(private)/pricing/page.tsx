"use client";
import { getUser } from "@/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { env } from "@/env";
import { Cardholder, Check, X } from "@phosphor-icons/react";
import { CheckIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const PricingPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const annualPrice = "$279.00";
  const monthlyPrice = "$29.00";
  const proMonthlyPrice = "$49.00";
  const proAnnualPrice = "$470.00";
  const annualSavingsPercentage = Math.round((1 - 279 / (29 * 12)) * 100);
  const proAnnualSavingsPercentage = Math.round((1 - 470 / (49 * 12)) * 100);

  const handleSubscribe = async (priceId: string) => {
    const user = await getUser();
    setIsLoading(true);

    try {
      const response = await fetch("/api/webhook/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, user }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as any;
        if (errorData.error === "User already has an active subscription") {
          toast.success("You already have an active subscription!");
          return;
        }
        throw new Error(
          `Failed to create checkout session: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as any;

      if (data.sessionUrl) {
        router.push(data.sessionUrl);
      } else {
        console.error("No session URL returned:", data);
        throw new Error("No session URL returned from server");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceId = (isPro: boolean = false) => {
    if (isPro) {
      return env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1QLXONRrqqSKPUNW7s5FxANR"
        : "";
    }
    const annualGrowPlan =
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1QMOYXRrqqSKPUNWcFVWJIs4"
        : "";
    return isAnnual
      ? annualGrowPlan
        ? "price_1QMOWRRrqqSKPUNWRV27Uiv7"
        : "price_1QMcQPRrqqSKPUNWXMw3yYy8"
      : env.NEXT_PUBLIC_NODE_ENV === "development"
      ? "price_1Q32F1RrqqSKPUNWkMQXCrVC"
      : "price_1Pb0w5RrqqSKPUNWGX1T2G3O";
  };

  const renderFeature = (feature: string, isAvailable: boolean) => (
    <div className="flex items-center w-full">
      <div
        className={`rounded-full p-1 ${
          isAvailable ? "bg-blue-500 text-white" : "bg-red-100 text-red-500"
        }`}
      >
        {isAvailable ? (
          <Check weight="bold" size={12} />
        ) : (
          <X weight="bold" size={12} />
        )}
      </div>
      <span className={`mx-4 ${!isAvailable && "text-gray-400 line-through"}`}>
        {feature}
      </span>
    </div>
  );

  return (
    <main className="p-8">
      <div className="space-y-12">
        <div className="text-left">
          <Link
            href="/settings"
            className="inline-flex transition-all items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4 stroke-2" />
            Back
          </Link>
          <div className="px-7 pt-4"></div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Pricing and Plans
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose the plan that best fits your needs and start creating amazing
            content today.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="flex items-center justify-center w-full space-x-2 mb-8">
          <span className="text-sm">Monthly</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className="text-sm">Annual</span>
        </div>
        {/* <div className="grid grid-cols-2 gap-8 justify-center"> */}
        <div className="flex flex-row items-center justify-center">
          <div className="max-w-sm w-full border rounded-lg dark:border-gray-700">
            <div className="p-6">
              <h1 className="text-lg font-semibold tracking-tight capitalize dark:text-white">
                {isAnnual ? "Annual Pro Plan" : "Monthly Pro Plan"}
                {isAnnual && (
                  <Badge className="ml-2 space-x-1 bg-indigo-50 font-normal text-indigo-500 hover:bg-indigo-50 hover:text-indigo-500">
                    {`Save ${annualSavingsPercentage}%`}
                  </Badge>
                )}
              </h1>

              <p className="text-sm text-muted-foreground">
                For individual creators.
              </p>

              <h2 className="mt-2 text-lg font-semibold sm:text-2xl">
                {isAnnual ? annualPrice : monthlyPrice}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  /{isAnnual ? "Year" : "Month"}
                </span>
              </h2>
              <Button
                loading={isLoading}
                onClick={() => handleSubscribe(getPriceId())}
                className="mt-4 w-full"
              >
                Start Now
              </Button>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div className="p-6 text-sm">
              <h1 className="text-base font-semibold tracking-tight capitalize dark:text-white">
                What's included:
              </h1>

              <div className="mt-4 space-y-4">
                {[
                  { feature: "Post Generator (50K words)", available: true },
                  {
                    feature:
                      "Repurpose Content from YouTube, Blogs, PDF, and Audio",
                    available: true,
                  },
                  { feature: "Create Your Own Voice", available: true },
                  { feature: "Idea Generator", available: true },
                  {
                    feature: "Inspiration from Top LinkedIn Influencers",
                    available: true,
                  },
                  { feature: "Save Ideas and Posts", available: true },
                  { feature: "Post Preview and Formatter", available: true },
                  { feature: "Content Scheduler", available: true },
                  // { feature: "Multiple Workspaces", available: false },
                ].map((item, index) => (
                  <div key={index}>
                    {renderFeature(item.feature, item.available)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* <div className="max-w-sm w-full border border-blue-500 rounded-lg dark:border-gray-700">
            <div className="p-6">
              <h1 className="text-lg font-semibold tracking-tight capitalize dark:text-white">
                {isAnnual ? "Annual Grow Plan" : "Monthly Grow Plan"}
                <Badge className="ml-2 space-x-1 bg-indigo-50 font-normal text-indigo-500 hover:bg-indigo-50 hover:text-indigo-500">
                  {isAnnual
                    ? `Save ${proAnnualSavingsPercentage}%`
                    : `Most Value`}
                </Badge>
              </h1>

              <p className="text-sm text-muted-foreground">
                For teams and power users.
              </p>

              <h2 className="mt-2 text-lg font-semibold sm:text-2xl">
                {isAnnual ? proAnnualPrice : proMonthlyPrice}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  /{isAnnual ? "Year" : "Month"}
                </span>
              </h2>
              <Button
                loading={isLoading}
                onClick={() => handleSubscribe(getPriceId(true))}
                className="mt-4 w-full"
              >
                Start Now
              </Button>
            </div>

            <hr className="border-gray border-blue-500" />

            <div className="p-6 text-sm">
              <h1 className="text-base font-semibold tracking-tight capitalize dark:text-white">
                What's included:
              </h1>

              <div className="mt-4 space-y-4">
                {[
                  {
                    feature: "Everything in the Pro Plan",
                    available: true,
                  },
                  {
                    feature: "Post Generator (75K words per workspace)",
                    available: true,
                  },
                  { feature: "Add up to 3 Workspaces", available: true },
                ].map((item, index) => (
                  <div key={index}>
                    {renderFeature(item.feature, item.available)}
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </main>
  );
};

export default PricingPage;

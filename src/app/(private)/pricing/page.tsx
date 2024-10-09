"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { env } from "@/env";
import { Cardholder } from "@phosphor-icons/react";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const PricingPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const annualPrice = "$200.00";
  const monthlyPrice = "$29.00";
  const annualSavingsPercentage = Math.round((1 - 200 / (29 * 12)) * 100);

  const handleSubscribe = async (priceId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      const data: any = await response.json();
      if (data.sessionUrl) {
        router.push(data.sessionUrl);
      } else {
        console.error("No session URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceId = () => {
    return isAnnual
      ? env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1Q32GdRrqqSKPUNWN1sG48XI"
        : "price_1Q1VQ4RrqqSKPUNWMMbGj3yh"
      : env.NEXT_PUBLIC_NODE_ENV === "development"
      ? "price_1Q32F1RrqqSKPUNWkMQXCrVC"
      : "price_1Pb0w5RrqqSKPUNWGX1T2G3O";
  };

  return (
    <div className="">
      <div className="container px-6 py-8 mx-auto">
        <div className="">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight capitalize">
              Our Pricing Plan
            </h1>
            <div className="mt-1">
              <span className="inline-block w-40 h-1 bg-blue-600 rounded-full"></span>
              <span className="inline-block w-3 h-1 mx-1 bg-blue-600 rounded-full"></span>
              <span className="inline-block w-1 h-1 bg-blue-600 rounded-full"></span>
            </div>

            <p className="mt-2 text-base text-muted-foreground">
              Start your content creation journey with Bluecast!
            </p>

            <div className="flex items-center space-x-2 mt-4">
              <span>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
              <span>Annual</span>
            </div>
          </div>

          <div className="flex-1 xl:mx-8">
            <div className="mt-8 space-y-8 md:-mx-4 md:flex md:items-center md:justify-center md:space-y-0 xl:mt-0">
              <div className="max-w-sm mx-auto border rounded-lg md:mx-4 dark:border-gray-700">
                <div className="p-6">
                  <h1 className="text-xl font-semibold tracking-tight capitalize dark:text-white">
                    {isAnnual ? "Annual" : "Monthly"} Launch Plan
                    {isAnnual && (
                      <Badge className="ml-4 space-x-1 bg-purple-50  text-purple-600 hover:bg-purple-100">
                        <Cardholder className="inline mr-1" size={15} />
                        Save {20}%
                      </Badge>
                    )}
                  </h1>

                  <p className="text-sm text-muted-foreground">
                    Our most popular plan for creators.
                  </p>

                  <h2 className="mt-4 text-xl font-semibold sm:text-3xl dark:">
                    {isAnnual ? annualPrice : monthlyPrice}{" "}
                    <span className="text-base font-semibold tracking-tight">
                      /{isAnnual ? "Year" : "Month"}
                    </span>
                  </h2>
                  <Button
                    loading={isLoading}
                    onClick={() => handleSubscribe(getPriceId())}
                    className="mt-6 w-full"
                  >
                    Start Now
                  </Button>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div className="p-6 text-sm">
                  <h1 className="text-lg font-semibold tracking-tight capitalize lg:text-xl dark:text-white">
                    What's included:
                  </h1>

                  <div className="mt-8 space-y-4">
                    {[
                      "Unlimited Post Generation",
                      "Repurpose Content",
                      "Create your own Writing Style",
                      "Idea Generator",
                      "Content Scheduler",
                      "Inspiration from Top LinkedIn Influencers",
                      "Post Preview and Formatter",
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className="mx-4 dark:">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

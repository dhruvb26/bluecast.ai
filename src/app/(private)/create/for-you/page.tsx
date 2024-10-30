"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ForYouCard from "@/components/for-you/for-you-card";
import Link from "next/link";
import { ForYouForm } from "@/components/forms/for-you-form";
import { BarLoader } from "react-spinners";
import { getForYouAnswers, getForYouPosts, getUser } from "@/actions/user";
import { toast } from "sonner";
import {
  ArrowsCounterClockwise,
  Brain,
  Empty,
  Sparkle,
} from "@phosphor-icons/react";
import ShinyLoader from "@/components/global/shiny-loader";
import { RefreshCcw } from "lucide-react";
import { usePostStore } from "@/store/post";
import SubscriptionCard from "@/components/global/subscription-card";
import Refresh2 from "@/components/icons/refresh-2";
import ProgressBar from "@/components/for-you/progress-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Post {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    headline: string;
    image: string;
  };
}

export default function ForYouPage() {
  const [loading, setLoading] = useState(true);
  const [hasAnsweredQuestions, setHasAnsweredQuestions] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { setShowFeatureGate, showFeatureGate } = usePostStore();
  const [refreshesUsed, setRefreshesUsed] = useState(0);
  const [maxRefreshes, setMaxRefreshes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const answersData = await getForYouAnswers();
        setHasAnsweredQuestions(!!answersData);

        if (answersData) {
          const postsData = (await getForYouPosts()) as Post[];
          setPosts(postsData);
        }

        const user = await getUser();
        const refreshes = Math.floor(user.forYouGeneratedPosts / 5);
        setRefreshesUsed(refreshes);

        if (!user.stripeSubscriptionId && !user.priceId) {
          setMaxRefreshes(1);
        } else {
          setMaxRefreshes(4);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      const formData = await getForYouAnswers();
      const response = await fetch("/api/ai/for-you", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        if (response.status === 403) {
          const errorResponse: any = await response.json();
          if (
            errorResponse.error ===
            "You have reached the maximum number of refreshes. Upgrade to get more refreshes."
          ) {
            setShowFeatureGate(true);
            throw new Error(
              "You have reached the maximum number of refreshes. Upgrade to get more refreshes."
            );
          } else if (
            errorResponse.error ===
            "You have reached the maximum number of refreshes. Limit resets every month."
          ) {
            throw new Error(
              "You have reached the maximum number of refreshes. Limit resets every month."
            );
          }
        }
        throw new Error("Failed to generate content");
      }
      toast.success("Posts generated successfully!");
      const postsData = (await getForYouPosts()) as Post[];
      setPosts(postsData);
      setRefreshesUsed((prev) => prev + 1);
    } catch (error: any) {
      console.error("Error generating content:", error);
      if (
        error.message ===
        "You have reached the maximum number of refreshes. Upgrade to get more refreshes."
      ) {
        toast.error(
          "You have reached the maximum number of refreshes. Upgrade to get more refreshes."
        );
      } else if (
        error.message ===
        "You have reached the maximum number of refreshes. Limit resets every month."
      ) {
        toast.error(
          "You have reached the maximum number of refreshes. Limit resets every month."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to generate content. Please try again."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <BarLoader color="#2563eb" height={3} width={300} />
      </div>
    );
  }

  if (!hasAnsweredQuestions) {
    return (
      <main className="p-8">
        <div className="mb-8">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Customize Your Preferences
          </h1>
          <p className="text-sm text-muted-foreground">
            Please answer a few questions to personalize your content.
          </p>
        </div>
        <ForYouForm />
      </main>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <ShinyLoader />
        {/* <h2 className="text-lg font-semibold tracking-tight">
          Generating Your Posts
        </h2> */}
        <p className="text-sm text-muted-foreground mb-4">
          Please wait while we create personalized content for you. May take up
          to 2 minutes.
        </p>
        <BarLoader color="#2563eb" height={3} width={300} />
      </div>
    );
  }

  return (
    <main className="p-8">
      {showFeatureGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <SubscriptionCard />
        </div>
      )}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Posts For You
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore personalized content based on your preferences. Hit refresh
            to generate new posts. Make sure to save any posts you like before
            refreshing.
          </p>
        </div>

        <div className="flex gap-2">
          {posts.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={"outline"}
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                  >
                    <Refresh2 className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px]">
                  <p className="text-xs">
                    {maxRefreshes === 1 ? (
                      <span className="text-xs">
                        You have {maxRefreshes - refreshesUsed} refresh left on
                        this trial.{" "}
                        <a
                          href="/pricing"
                          className="text-blue-600 underline hover:text-blue-700"
                        >
                          Upgrade
                        </a>{" "}
                        to get 4 refreshes per month!
                      </span>
                    ) : (
                      `You have ${
                        maxRefreshes - refreshesUsed
                      } refreshes left this month.`
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Link href="/create/for-you/preferences">
            <Button>Update Preferences</Button>
          </Link>
        </div>
      </div>
      <ProgressBar />
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ForYouCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
          <div className="mb-2">
            <Empty className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            No posts available
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Create your customized feed now. Click the button to get started.
          </p>
          <Button onClick={handleGenerateContent}>Generate For Me</Button>
        </div>
      )}
    </main>
  );
}

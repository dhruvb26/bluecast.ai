"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUser, getGeneratedWords, getGeneratedPosts } from "@/actions/user";
import { usePostStore } from "@/store/post";
import Link from "next/link";

const WordsCard = () => {
  const [user, setUser] = useState<any>(null);
  const [generatedWords, setGeneratedWords] = useState(0);
  const [generatedPosts, setGeneratedPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const submissionSuccessful = usePostStore(
    (state) => state.submissionSuccessful
  );
  const setSubmissionSuccessful = usePostStore(
    (state) => state.setSubmissionSuccessful
  );

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const userData = await getUser();
      setUser(userData);
      if (userData?.specialAccess) {
        const posts = await getGeneratedPosts();
        setGeneratedPosts(posts);
      }
      if (userData?.hasAccess) {
        const words = await getGeneratedWords();
        setGeneratedWords(words);
      }
      setIsLoading(false);
    };
    fetchUserData();
    setSubmissionSuccessful(false);
  }, []);

  const limit = user?.specialAccess ? 10 : 50000;
  const generated = user?.specialAccess ? generatedPosts : generatedWords;
  const hasHitLimit = generated >= limit;

  const formatNumber = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  const isLaunchUser = user?.stripeSubscriptionId && user?.stripeCustomerId;

  return (
    <Card className="border-none p-0 w-full">
      <CardHeader className="p-2 pt-2 md:p-2">
        <CardTitle className="flex items-center justify-between">
          <Badge
            className={`${
              isLaunchUser
                ? "bg-blue-600 hover:bg-blue-600 font-normal tracking-normal"
                : "bg-yellow-400 hover:bg-yellow-400 font-normal tracking-normal"
            } text-xs`}
          >
            {isLaunchUser ? "Launch" : "Trial"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {user?.specialAccess ? (
            hasHitLimit ? (
              <>
                You've hit the limit.{" "}
                <Link href="/pricing" className="text-blue-600 hover:underline">
                  Upgrade your plan
                </Link>{" "}
                for more content generation.
              </>
            ) : (
              <>
                This trial allows you to generate 10 posts as of now.{" "}
                <Link
                  href={"/pricing"}
                  className="text-blue-600 hover:underline"
                >
                  Upgrade your plan
                </Link>{" "}
                for more content generation.{" "}
                <Link
                  href="/settings"
                  className="text-blue-600 hover:underline"
                >
                  Check usage here
                </Link>
                .
              </>
            )
          ) : isLaunchUser ? (
            <>
              This plan allows you to generate 50k words monthly as of now. More
              features & plans coming soon.{" "}
              <Link href="/settings" className="text-blue-600 hover:underline">
                Check usage here
              </Link>
              .
            </>
          ) : (
            <>
              This plan allows you to generate 50k words monthly as of now. More
              features & plans coming soon.{" "}
              <Link href="/settings" className="text-blue-600 hover:underline">
                Check usage here
              </Link>
              .
            </>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
export default WordsCard;

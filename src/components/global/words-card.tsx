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
  const submissionSuccessful = usePostStore(
    (state) => state.submissionSuccessful
  );
  const setSubmissionSuccessful = usePostStore(
    (state) => state.setSubmissionSuccessful
  );

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUser();
      setUser(userData);
      if (userData.specialAccess) {
        const posts = await getGeneratedPosts();
        setGeneratedPosts(posts);
      }
      if (userData.hasAccess) {
        const words = await getGeneratedWords();
        setGeneratedWords(words);
      }
    };
    fetchUserData();
    setSubmissionSuccessful(false);
  }, [submissionSuccessful, setSubmissionSuccessful]);

  const limit = user?.specialAccess ? 10 : 50000;
  const generated = user?.specialAccess ? generatedPosts : generatedWords;
  const percentage = (generated / limit) * 100;
  const hasHitLimit = generated >= limit;

  const formatNumber = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num;
  };

  return (
    <Card className="border-none p-0 w-full">
      <CardHeader className="p-2 pt-2 md:p-2">
        <CardTitle className="mb-2 flex items-center justify-between">
          <Badge className="bg-blue-600 text-xs">Launch</Badge>
          <span className="text-xs text-foreground">
            {formatNumber(generated)} / {formatNumber(limit)}
          </span>
        </CardTitle>
        <div className="mb-2 h-1.5 w-full rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
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
              "This plan allows you to generate 10 posts as of now."
            )
          ) : (
            "This plan allows you to generate 50k words monthly as of now."
          )}
          {" More features & plans coming soon."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default WordsCard;

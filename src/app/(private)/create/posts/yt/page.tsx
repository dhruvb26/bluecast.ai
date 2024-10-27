"use client";

import React from "react";
import { YouTubeForm } from "@/components/forms/yt-form";
import { GeneratedContent } from "@/components/global/generated-content";

const YouTubeLinkedInPage = () => {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Convert YouTube Video to LinkedIn Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Simply paste the URL of your video and we'll generate a LinkedIn post
          for you.
        </p>
      </div>
      <div className="flex w-full flex-grow flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <YouTubeForm />
        </div>
        <div className="w-full lg:w-1/2">
          <GeneratedContent />
        </div>
      </div>
    </main>
  );
};
export default YouTubeLinkedInPage;

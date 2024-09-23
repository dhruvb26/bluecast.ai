"use client";

import React from "react";
import { GeneratedContent } from "@/components/global/generated-content";
import { TranscribeForm } from "@/components/forms/transcribe-form";

const VideoLinkedInPage = () => {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Convert any Audio to LinkedIn Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Simply upload your video file and we'll generate a LinkedIn post for
          you.
        </p>
      </div>
      <div className="flex w-full flex-grow flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <TranscribeForm />
        </div>
        <div className="w-full lg:w-1/2">
          <GeneratedContent />
        </div>
      </div>
    </main>
  );
};
export default VideoLinkedInPage;

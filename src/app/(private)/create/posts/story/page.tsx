"use client";

import React from "react";
import { GeneratedContent } from "@/components/global/generated-content";
import { ShareStoryForm } from "@/components/forms/share-story-form";

const ScratchStoryContent = () => {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Share your story
        </h1>
        <p className="text-sm text-muted-foreground">
          Let AI inspire your creativity from a blank canvas.
        </p>
      </div>
      <div className="flex w-full flex-grow flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <ShareStoryForm />
        </div>
        <div className="w-full lg:w-1/2">
          <GeneratedContent />
        </div>
      </div>
    </main>
  );
};

export default ScratchStoryContent;

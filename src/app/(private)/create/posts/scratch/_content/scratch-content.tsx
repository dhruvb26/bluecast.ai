"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ScratchStoryForm } from "@/components/forms/scratch-story-form";
import { GeneratedContent } from "@/components/global/generated-content";

const ScratchStoryContent = () => {
  const searchParams = useSearchParams();
  const [idea, setIdea] = React.useState<string | null>(null);

  useEffect(() => {
    setIdea(searchParams.get("idea"));
  }, [searchParams]);

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Craft Your Original Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Let AI inspire your creativity from a blank canvas.
        </p>
      </div>
      <div className="flex w-full flex-grow flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <ScratchStoryForm initialPostContent={idea || ""} />
        </div>
        <div className="w-full lg:w-1/2">
          <GeneratedContent />
        </div>
      </div>
    </main>
  );
};

export default ScratchStoryContent;

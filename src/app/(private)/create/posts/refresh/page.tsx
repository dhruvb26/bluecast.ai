"use client";

import React from "react";
import { GeneratedContent } from "@/components/global/generated-content";
import { MakeItBetterForm } from "@/components/forms/make-it-better-form";

const MakeItBetterPage = () => {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Refresh Your Existing Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Use our AI-powered tool to enhance and improve your existing posts. No
          need to rewrite from scratch, just let our AI do the work for you.
        </p>
      </div>
      <div className="flex w-full flex-grow flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <MakeItBetterForm />
        </div>
        <div className="w-full lg:w-1/2">
          <GeneratedContent />
        </div>
      </div>
    </main>
  );
};

export default MakeItBetterPage;

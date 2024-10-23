"use client";

import React from "react";
import { GeneratedContent } from "@/components/global/generated-content";
import { MakeItBetterForm } from "@/components/forms/make-it-better-form";

const MakeItBetterPage = () => {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Refresh Writing Style of Your Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Instantly transform any post with our AI-powered tool, giving it a
          fresh and unique writing style. No need to rewrite, just let AI do the
          rest.
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

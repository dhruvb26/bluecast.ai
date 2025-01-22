"use client";

import React from "react";
import { FunnelTemplateForm } from "@/components/forms/funnel-template-form";
import { GeneratedContent } from "@/components/global/generated-content";

const FunnelPageContent = () => {

  return (
    <main className="w-full">
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Funnel Prompts Powered Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a post that is powered by a funnel template.
        </p>
      </div>
      <div className="flex w-full flex-grow flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <FunnelTemplateForm  />
        </div>
        <div className="w-full lg:w-1/2">
          <GeneratedContent />
        </div>
      </div>
    </main>
  );
};
export default FunnelPageContent;

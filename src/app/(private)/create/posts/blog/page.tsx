"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { BlogForm } from "@/components/forms/blog-form";
import { GeneratedContent } from "@/components/global/generated-content";
import { ChevronLeft } from "lucide-react";

const BlogLinkedInPage = () => {
  return (
    <main>
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Convert any Blog to LinkedIn Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Simply paste the URL of the blog and we'll generate a LinkedIn post
          for you.
        </p>
      </div>
      {/* <div className="mb-2 rounded-md bg-blue-100 p-4 text-left text-sm text-blue-600">
        <span>
          <strong>NOTE: </strong>
          If you can't get the URL to work here, try converting the page to a
          PDF using (Ctrl + P) and then head over to our PDF repurposing
          template, so your content creation journey is never stopped.
        </span>
      </div> */}
      <div className="flex w-full flex-grow flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <BlogForm />
        </div>
        <div className="w-full lg:w-1/2">
          <GeneratedContent />
        </div>
      </div>
    </main>
  );
};
export default BlogLinkedInPage;

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
      <div className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Convert any Blog to LinkedIn Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Simply paste the URL of the blog and we'll generate a LinkedIn post
          for you.
        </p>
      </div>
      <div className="mb-2 rounded-md bg-blue-50 p-4 text-left text-sm text-blue-600">
        <span>
          <strong>NOTE: </strong>
          If you encounter a{" "}
          <span className="text-red-500">
            "Failed to submit. Try again later"
          </span>{" "}
          error, consider converting the page to PDF format, then proceed to our{" "}
          <Link
            href="/create/posts/pdf"
            className="text-blue-700 hover:underline underline"
          >
            PDF repurposing template
          </Link>
          . This ensures your content creation journey continues smoothly, even
          with challenging web pages.
        </span>
      </div>
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

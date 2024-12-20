"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { BlogForm } from "@/components/forms/blog-form";
import { GeneratedContent } from "@/components/global/generated-content";
import { ChevronLeft } from "lucide-react";

const BlogLinkedInPage = () => {
  return (
    <main className="w-full">
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Convert any Blog to LinkedIn Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Simply paste the URL of the blog and we'll generate a LinkedIn post
          for you.
        </p>
      </div>
      {/* <div className="mb-4 rounded-md bg-indigo-50 p-4 text-left text-sm text-indigo-500 border border-indigo-200">
        <span>
          <strong>NOTE: </strong>
          If you encounter a{" "}
          <span className="text-red-500 font-medium">
            Failed to submit. Try again later.
          </span>{" "}
          Consider converting the page to PDF, and then proceed to our{" "}
          <Link
            href="/create/posts/pdf"
            className="text-indigo-600 font-medium hover:underline"
          >
            PDF Repurpose Template
          </Link>
          . We're working on a fix right now.
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

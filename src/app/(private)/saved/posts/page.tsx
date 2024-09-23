import React, { Suspense } from "react";
import SavedDraftsContent from "./_content/posts-content";
import CustomLoader from "@/components/global/custom-loader";

export default function SavedDraftsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <CustomLoader size={32} className="stroke-1 text-primary" />
        </div>
      }
    >
      <SavedDraftsContent />
    </Suspense>
  );
}

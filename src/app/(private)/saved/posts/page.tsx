import React, { Suspense } from "react";
import SavedDraftsContent from "./_content/posts-content";
import { Loader2 } from "lucide-react";

export default function SavedDraftsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 size={32} className="animate-spin" />
        </div>
      }
    >
      <SavedDraftsContent />
    </Suspense>
  );
}

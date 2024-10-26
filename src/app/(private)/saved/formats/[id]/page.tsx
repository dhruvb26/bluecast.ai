"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import FormatContent from "../_content/formats-content";

export default function FormatPage() {
  return (
    <Suspense fallback={<Loader2 size={32} className="animate-spin" />}>
      <FormatContent />
    </Suspense>
  );
}

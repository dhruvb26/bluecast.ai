"use client";

import { Suspense } from "react";
import CustomLoader from "@/components/global/custom-loader";
import FormatContent from "../_content/formats-content";

export default function FormatPage() {
  return (
    <Suspense fallback={<CustomLoader size={32} />}>
      <FormatContent />
    </Suspense>
  );
}

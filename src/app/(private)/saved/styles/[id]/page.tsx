"use client";

import { Suspense } from "react";
import CustomLoader from "@/components/global/custom-loader";
import StylesContent from "../_content/styles-content";

export default function FormatPage() {
  return (
    <Suspense fallback={<CustomLoader size={32} />}>
      <StylesContent />
    </Suspense>
  );
}

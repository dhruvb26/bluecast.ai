"use client";

import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import StylesContent from "../_content/styles-content";

export default function FormatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <BarLoader color="#1d51d7" height={3} width={300} />
        </div>
      }
    >
      <StylesContent />
    </Suspense>
  );
}

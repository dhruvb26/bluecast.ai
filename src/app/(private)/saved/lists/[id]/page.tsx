"use client";

import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import ListsContent from "../_content/lists-content";

export default function ListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <BarLoader color="#1d51d7" height={3} width={300} />
        </div>
      }
    >
      <ListsContent />
    </Suspense>
  );
}

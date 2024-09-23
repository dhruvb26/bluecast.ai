import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const ScratchStoryContent = dynamic(
  () => import("./_content/scratch-content"),
  {
    ssr: false,
  }
);

const ScratchStoryPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScratchStoryContent />
    </Suspense>
  );
};

export default ScratchStoryPage;

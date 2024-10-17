import React, { useState, useEffect } from "react";

export default function ShinyLoader({
  className = "",
}: {
  className?: string;
}) {
  const sentences = [
    "Thinking",
    "Generating custom posts",
    "Tailoring to your preferences",
    "Almost there",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const sentenceInterval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sentences.length);
    }, 4000); // Change sentence every 4 seconds

    return () => {
      clearInterval(sentenceInterval);
    };
  }, []);

  return (
    <div
      className={`shiny-text-container bg-white rounded-lg px-4 py-2 ${className}`}
    >
      <p
        key={currentIndex}
        className="bg-shine-gradient bg-shine-size animate-shine bg-clip-text text-transparent text-lg font-semibold tracking-tight"
      >
        {sentences[currentIndex]}
      </p>
    </div>
  );
}

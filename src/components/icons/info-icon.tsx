"use client";

import React from "react";
import Image from "next/image";

interface InfoIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({
  width = 24,
  height = 24,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 bg-white rounded-md dark:bg-blue-800 ${className}`}
    >
      <Image
        src="/brand/Bluecast Symbol.png"
        width={20}
        height={20}
        alt="Bluecast Logo"
      />
    </div>
  );
};

export default InfoIcon;

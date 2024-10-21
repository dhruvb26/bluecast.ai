"use client";

import React from "react";
import { CheckCircle } from "@phosphor-icons/react";

interface SuccessIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const SuccessIcon: React.FC<SuccessIconProps> = ({
  width = 24,
  height = 24,
  color = "#22C55E",
  className = "",
}) => {
  return (
    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-md dark:bg-green-800 dark:text-green-200">
      <CheckCircle size={20} weight="fill" className="text-green-500" />
    </div>
  );
};

export default SuccessIcon;

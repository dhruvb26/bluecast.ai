"use client";

import React from "react";
import { XCircle } from "@phosphor-icons/react";

interface ErrorIconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

const ErrorIcon: React.FC<ErrorIconProps> = ({
  width = 24,
  height = 24,
  color = "#EF4444",
  className = "",
}) => {
  return (
    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-md dark:bg-red-800 dark:text-red-200">
      <XCircle size={20} weight="fill" className="text-red-500" />
    </div>
  );
};

export default ErrorIcon;

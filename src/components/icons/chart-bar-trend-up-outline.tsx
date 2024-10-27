import React from "react";
import { cn } from "@/lib/utils";

interface ChartBarTrendUpOutlineProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

function ChartBarTrendUpOutline({
  className,
  ...props
}: ChartBarTrendUpOutlineProps) {
  return (
    <svg
      className={cn("w-6 h-6", className)}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g className="stroke-current">
        <path
          d="M14.75 2.75H14.25C13.6977 2.75 13.25 3.19772 13.25 3.75V14.25C13.25 14.8023 13.6977 15.25 14.25 15.25H14.75C15.3023 15.25 15.75 14.8023 15.75 14.25V3.75C15.75 3.19772 15.3023 2.75 14.75 2.75Z"
          className="fill-current opacity-30"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <path
          d="M9.25 7.75H8.75C8.19772 7.75 7.75 8.19772 7.75 8.75V14.25C7.75 14.8023 8.19772 15.25 8.75 15.25H9.25C9.80228 15.25 10.25 14.8023 10.25 14.25V8.75C10.25 8.19772 9.80228 7.75 9.25 7.75Z"
          className="fill-current opacity-30"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <path
          d="M3.75 11.75H3.25C2.69772 11.75 2.25 12.1977 2.25 12.75V14.25C2.25 14.8023 2.69772 15.25 3.25 15.25H3.75C4.30228 15.25 4.75 14.8023 4.75 14.25V12.75C4.75 12.1977 4.30228 11.75 3.75 11.75Z"
          className="fill-current opacity-30"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <path
          d="M6.25 2.75H8.75V5.25"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <path
          d="M8.5 3L2.75 8.75"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

export default ChartBarTrendUpOutline;

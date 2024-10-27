import React from "react";
import { cn } from "@/lib/utils";

interface LightbulbOutlineProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

function LightbulbOutline({ className, ...props }: LightbulbOutlineProps) {
  return (
    <svg
      className={cn("w-6 h-6", className)}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g className="fill-current">
        <path
          className="text-current opacity-30"
          d="M7.973 4.358C11.045 3.714 13.75 6.041 13.75 9C13.75 10.8669 12.6695 12.4752 11.1028 13.25H6.89721C5.11106 12.3665 3.95706 10.3995 4.315 8.202C4.623 6.315 6.101 4.75 7.973 4.358Z"
          fillRule="evenodd"
        />
        <path
          d="M9 0.75V1.75"
          className="stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M14.834 3.16599L14.127 3.87299"
          className="stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M17.25 9H16.25"
          className="stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M3.166 3.16599L3.873 3.87299"
          className="stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M0.75 9H1.75"
          className="stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M13.75 9C13.75 6.041 11.045 3.714 7.973 4.358C6.101 4.75 4.623 6.315 4.315 8.202C3.934 10.541 5.266 12.619 7.25 13.407V15.75C7.25 16.302 7.698 16.75 8.25 16.75H9.75C10.302 16.75 10.75 16.302 10.75 15.75V13.407C12.505 12.71 13.75 11.004 13.75 9Z"
          className="stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M6.897 13.25H11.103"
          className="stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          fill="none"
        />
      </g>
    </svg>
  );
}

export default LightbulbOutline;

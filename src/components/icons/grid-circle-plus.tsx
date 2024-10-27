import React from "react";
import { cn } from "@/lib/utils";

interface GridCirclePlusProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

function GridCirclePlus({ className, ...props }: GridCirclePlusProps) {
  return (
    <svg
      className={cn("w-6 h-6", className)}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g className="fill-current">
        <path
          className="text-current"
          d="M15.5,12h-1.75v-1.75c0-.414-.336-.75-.75-.75s-.75,.336-.75,.75v1.75h-1.75c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h1.75v1.75c0,.414,.336,.75,.75,.75s.75-.336,.75-.75v-1.75h1.75c.414,0,.75-.336,.75-.75s-.336-.75-.75-.75Z"
        />
        <circle cx="5" cy="5" r="3.25" />
        <circle cx="13" cy="5" r="3.25" />
        <circle cx="5" cy="13" r="3.25" />
      </g>
    </svg>
  );
}

export default GridCirclePlus;

import React from "react";
import { cn } from "@/lib/utils";

interface CalendarDaysProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  width?: string;
  height?: string;
}

function CalendarDays({
  className,
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: CalendarDaysProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      className={cn("w-6 h-6", className)}
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill={fill}>
        <path
          d="M5.75,3.5c-.414,0-.75-.336-.75-.75V.75c0-.414,.336-.75,.75-.75s.75,.336,.75,.75V2.75c0,.414-.336,.75-.75,.75Z"
          fill={fill}
        />
        <path
          d="M12.25,3.5c-.414,0-.75-.336-.75-.75V.75c0-.414,.336-.75,.75-.75s.75,.336,.75,.75V2.75c0,.414-.336,.75-.75,.75Z"
          fill={fill}
        />
        <path
          d="M13.75,2H4.25c-1.517,0-2.75,1.233-2.75,2.75V13.25c0,1.517,1.233,2.75,2.75,2.75H13.75c1.517,0,2.75-1.233,2.75-2.75V4.75c0-1.517-1.233-2.75-2.75-2.75Zm0,12.5H4.25c-.689,0-1.25-.561-1.25-1.25V7H15v6.25c0,.689-.561,1.25-1.25,1.25Z"
          fill={fill}
        />
        <path
          d="M9,8.25c-.551,0-1,.449-1,1s.449,1,1,1,1-.449,1-1-.449-1-1-1Z"
          fill={secondaryfill}
        />
        <path
          d="M12.5,10.25c.551,0,1-.449,1-1s-.449-1-1-1-1,.449-1,1,.449,1,1,1Z"
          fill={secondaryfill}
        />
        <path
          d="M9,11.25c-.551,0-1,.449-1,1s.449,1,1,1,1-.449,1-1-.449-1-1-1Z"
          fill={secondaryfill}
        />
        <path
          d="M5.5,11.25c-.551,0-1,.449-1,1s.449,1,1,1,1-.449,1-1-.449-1-1-1Z"
          fill={secondaryfill}
        />
        <path
          d="M12.5,11.25c-.551,0-1,.449-1,1s.449,1,1,1,1-.449,1-1-.449-1-1-1Z"
          fill={secondaryfill}
        />
      </g>
    </svg>
  );
}

export default CalendarDays;

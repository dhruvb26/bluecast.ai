import React from "react";
import { cn } from "@/lib/utils";

interface HouseProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  width?: string;
  height?: string;
}

function House({
  className,
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1em",
  height = "1em",
  ...props
}: HouseProps) {
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
          d="M15.309,5.603L10.059,1.613c-.624-.475-1.495-.474-2.118,0L2.691,5.603s0,0,0,0c-.433,.329-.691,.85-.691,1.393v7.254c0,1.517,1.233,2.75,2.75,2.75h3.5v-3.75c0-.414,.336-.75,.75-.75s.75,.336,.75,.75v3.75h3.5c1.517,0,2.75-1.233,2.75-2.75V6.996c0-.543-.258-1.064-.691-1.394Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}

export default House;

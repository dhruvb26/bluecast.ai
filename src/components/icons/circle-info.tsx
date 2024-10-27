import React from "react";

interface CircleInfoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
}

function CircleInfo({
  className = "",
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1.5,
  width = "1.05em",
  height = "1.05em",
  ...props
}: CircleInfoProps) {
  const secondaryFill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill={fill}>
        <circle
          cx="9"
          cy="9"
          fill="none"
          r="7.25"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <line
          fill="none"
          stroke={secondaryFill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="9"
          x2="9"
          y1="12.819"
          y2="8.25"
        />
        <path
          d="M9,6.75c-.552,0-1-.449-1-1s.448-1,1-1,1,.449,1,1-.448,1-1,1Z"
          fill={secondaryFill}
          stroke="none"
        />
      </g>
    </svg>
  );
}

export default CircleInfo;

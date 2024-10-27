import React from "react";

interface PenWritingProps extends React.SVGProps<SVGSVGElement> {
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  className?: string;
}

function PenWriting({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1.5,
  width = "1.25em",
  height = "1.25em",
  className = "",
  ...props
}: PenWritingProps) {
  const secondaryFill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill={fill}>
        <line
          fill="none"
          stroke={secondaryFill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="17"
          x2="12"
          y1="17"
          y2="17"
        />
        <path
          d="m3,17l1-5L12.414,3.586c.781-.781,2.047-.781,2.828,0l1.172,1.172c.781.781.781,2.047,0,2.828l-8.414,8.414-5,1Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export default PenWriting;

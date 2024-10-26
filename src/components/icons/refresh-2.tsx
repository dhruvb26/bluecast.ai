import React from "react";

interface Refresh2Props extends React.SVGProps<SVGSVGElement> {
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  className?: string;
}

function Refresh2({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1.5,
  width = "1em",
  height = "1em",
  className = "",
  ...props
}: Refresh2Props) {
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
        <polyline
          fill="none"
          points="8.5 12.75 10.75 15 8.5 17.25"
          stroke={secondaryFill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <polyline
          fill="none"
          points="9.5 5.25 7.25 3 9.5 .75"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M4.952,4.238c-1.347,1.146-2.202,2.855-2.202,4.762,0,3.452,2.798,6.25,6.25,6.25,.579,0,1.14-.079,1.672-.226"
          fill="none"
          stroke={secondaryFill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M13.048,13.762c1.347-1.146,2.202-2.855,2.202-4.762,0-3.452-2.798-6.25-6.25-6.25-.597,0-1.175,.084-1.722,.24"
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

export default Refresh2;

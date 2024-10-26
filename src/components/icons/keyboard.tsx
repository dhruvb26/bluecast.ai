import React from "react";

interface KeyboardProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
}

function Keyboard({
  className = "",
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1.5em",
  height = "1.5em",
  ...props
}: KeyboardProps) {
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
        <rect
          height="8.5"
          width="16.5"
          fill="none"
          rx="2"
          ry="2"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x=".75"
          y="4.75"
        />
        <rect
          height="1.5"
          width="1.5"
          fill={secondaryFill}
          rx=".5"
          ry=".5"
          stroke="none"
          x="3"
          y="7"
        />
        <rect
          height="1.5"
          width="1.5"
          fill={secondaryFill}
          rx=".5"
          ry=".5"
          stroke="none"
          x="3"
          y="9.5"
        />
        <rect
          height="1.5"
          width="1.5"
          fill={secondaryFill}
          rx=".5"
          ry=".5"
          stroke="none"
          x="5.5"
          y="7"
        />
        <rect
          height="1.5"
          width="1.5"
          fill={secondaryFill}
          rx=".5"
          ry=".5"
          stroke="none"
          x="8.25"
          y="7"
        />
        <rect
          height="1.5"
          width="1.5"
          fill={secondaryFill}
          rx=".5"
          ry=".5"
          stroke="none"
          x="13.5"
          y="7"
        />
        <rect
          height="1.5"
          width="1.5"
          fill={secondaryFill}
          rx=".5"
          ry=".5"
          stroke="none"
          x="13.5"
          y="9.5"
        />
        <rect
          height="1.5"
          width="1.5"
          fill={secondaryFill}
          rx=".5"
          ry=".5"
          stroke="none"
          x="11"
          y="7"
        />
        <line
          fill="none"
          stroke={secondaryFill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
          x1="11.75"
          x2="6.25"
          y1="10.25"
          y2="10.25"
        />
      </g>
    </svg>
  );
}

export default Keyboard;

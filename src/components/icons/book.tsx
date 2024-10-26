import React from "react";

interface BookProps extends React.SVGProps<SVGSVGElement> {
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  className?: string;
}

function Book({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1.5,
  width = "1.25em",
  height = "1.25em",
  className = "",
  ...props
}: BookProps) {
  const secondaryFill = secondaryfill || fill;

  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g fill={fill} strokeLinecap="butt" strokeLinejoin="miter">
        <line
          fill="none"
          stroke={secondaryFill}
          strokeMiterlimit="10"
          strokeWidth={strokewidth}
          x1="12"
          x2="12"
          y1="6"
          y2="21"
        />
        <path
          d="m17.5,3c-3,0-5.5,1.3-5.5,3,0-1.7-2.5-3-5.5-3S1,4.3,1,6v15c0-1.7,2.5-3,5.5-3s5.5,1.3,5.5,3c0-1.7,2.5-3,5.5-3s5.5,1.3,5.5,3V6c0-1.7-2.5-3-5.5-3Z"
          fill="none"
          stroke={fill}
          strokeLinecap="square"
          strokeMiterlimit="10"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
}

export default Book;

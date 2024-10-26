import React from "react";

interface GridCirclePlusLineProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const GridCirclePlusLine: React.FC<GridCirclePlusLineProps> = ({
  className,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      className={`w-5 h-5 ${className}`}
      {...props}
    >
      <line
        x1="13"
        x2="13"
        y1="10.25"
        y2="15.25"
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="15.5"
        x2="10.5"
        y1="12.75"
        y2="12.75"
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="5"
        cy="5"
        r="2.5"
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="13"
        cy="5"
        r="2.5"
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="5"
        cy="13"
        r="2.5"
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default GridCirclePlusLine;

import React from "react";

interface Sidebar2Props {
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  width?: string;
  height?: string;
  className?: string;
}

function Sidebar2({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  width = "1.2em",
  height = "1.2em",
  className = "",
}: Sidebar2Props) {
  return (
    <svg
      height={height}
      width={width}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill={fill}>
        <path
          d="m20,3H4c-1.654,0-3,1.346-3,3v12c0,1.654,1.346,3,3,3h16c1.654,0,3-1.346,3-3V6c0-1.654-1.346-3-3-3ZM3,18V6c0-.551.449-1,1-1h11v14H4c-.551,0-1-.449-1-1Z"
          fill={fill}
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}

export default Sidebar2;

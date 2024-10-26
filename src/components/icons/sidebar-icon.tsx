import React from "react";

interface SidebarIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

function SidebarIcon({ className = "", ...props }: SidebarIconProps) {
  return (
    <svg
      className={`w-5 h-5 ${className}`}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g strokeLinecap="butt" strokeLinejoin="miter">
        <line
          className="stroke-current"
          fill="none"
          strokeMiterlimit="10"
          strokeWidth="1.5"
          x1="15"
          x2="15"
          y1="4"
          y2="20"
        />
        <rect
          className="stroke-current"
          height="20"
          width="16"
          fill="none"
          rx="2"
          ry="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          strokeWidth="1.5"
          transform="translate(24) rotate(90)"
          x="4"
          y="2"
        />
      </g>
    </svg>
  );
}

export default SidebarIcon;

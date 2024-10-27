import React from "react";
import { cn } from "@/lib/utils";

interface MenuIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

function MenuIcon({ className, ...props }: MenuIconProps) {
  return (
    <svg
      className={cn("h-[1em] w-[1em]", className)}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g>
        <path d="M45,22H3c-0.552,0-1,0.448-1,1v2c0,0.552,0.448,1,1,1h42c0.552,0,1-0.448,1-1v-2 C46,22.448,45.552,22,45,22z" />
        <path d="M23,36H3c-0.552,0-1,0.448-1,1v2c0,0.552,0.448,1,1,1h20c0.552,0,1-0.448,1-1v-2C24,36.448,23.552,36,23,36z " />
        <path d="M45,8H25c-0.552,0-1,0.448-1,1v2c0,0.552,0.448,1,1,1h20c0.552,0,1-0.448,1-1V9C46,8.448,45.552,8,45,8z" />
      </g>
    </svg>
  );
}

export default MenuIcon;

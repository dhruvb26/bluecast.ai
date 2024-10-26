import React from "react";
import { cn } from "@/lib/utils";

interface MsgBubbleUserProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const MsgBubbleUser: React.FC<MsgBubbleUserProps> = ({
  className,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      className={cn("w-6 h-6", className)}
      {...props}
    >
      <g>
        <path
          d="M13.25 1.25C11.041 1.25 9.25 3.041 9.25 5.25C9.25 5.978 9.447 6.658 9.787 7.246C10.024 7.691 9.758 8.742 9.25 9.25C9.94 9.287 10.848 8.976 11.254 8.713C11.524 8.869 11.952 9.075 12.512 9.181C12.751 9.226 12.998 9.25 13.25 9.25C15.459 9.25 17.25 7.459 17.25 5.25C17.25 3.041 15.459 1.25 13.25 1.25Z"
          className="fill-current opacity-30"
        />
        <path
          d="M13.25 1.25C11.041 1.25 9.25 3.041 9.25 5.25C9.25 5.978 9.447 6.658 9.787 7.246C10.024 7.691 9.758 8.742 9.25 9.25C9.94 9.287 10.848 8.976 11.254 8.713C11.524 8.869 11.952 9.075 12.512 9.181C12.751 9.226 12.998 9.25 13.25 9.25C15.459 9.25 17.25 7.459 17.25 5.25C17.25 3.041 15.459 1.25 13.25 1.25Z"
          className="fill-none stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <path
          d="M4.55099 10.75C5.65556 10.75 6.55099 9.85457 6.55099 8.75C6.55099 7.64543 5.65556 6.75 4.55099 6.75C3.44643 6.75 2.55099 7.64543 2.55099 8.75C2.55099 9.85457 3.44643 10.75 4.55099 10.75Z"
          className="fill-none stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <path
          d="M0.75 16C1.275 14.403 2.778 13.25 4.551 13.25C6.324 13.25 7.827 14.403 8.352 16"
          className="fill-none stroke-current"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
};

export default MsgBubbleUser;

import React from "react";

interface ArrowDoorOutProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const ArrowDoorOut: React.FC<ArrowDoorOutProps> = ({
  className = "",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      className={`w-6 h-6 ${className}`}
      {...props}
    >
      <path
        d="M3.45699 2.64801L6.77799 4.70701C7.07199 4.88901 7.25099 5.21101 7.25099 5.55701V12.444C7.25099 12.79 7.07199 13.111 6.77799 13.294L3.45599 15.354"
        className="fill-current opacity-30"
      />
      <path
        d="M11.75 5.75V3.25C11.75 2.698 11.302 2.25 10.75 2.25H4.25C3.698 2.25 3.25 2.698 3.25 3.25V14.75C3.25 15.302 3.698 15.75 4.25 15.75H10.75C11.302 15.75 11.75 15.302 11.75 14.75V12.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 6.25L17.25 9L14.5 11.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17.25 9H11.25" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M3.45699 2.64801L6.77799 4.70701C7.07199 4.88901 7.25099 5.21101 7.25099 5.55701V12.444C7.25099 12.79 7.07199 13.111 6.77799 13.294L3.45599 15.354"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowDoorOut;

import React from "react";

interface GemSparkleProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const GemSparkle: React.FC<GemSparkleProps> = ({
  className = "",
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
      <g>
        <path
          d="M15.145,5.5l.586,.623c.33,.351,.36,.885,.07,1.27l-5.993,7.956c-.403,.535-1.214,.535-1.616,0L2.199,7.393c-.29-.385-.26-.918,.07-1.27l2.404-2.556c.191-.203,.458-.318,.738-.318h5.339"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <path
          d="M15.743,1.992l-.946-.315-.316-.947c-.102-.306-.609-.306-.711,0l-.316,.947-.946,.315c-.153,.051-.257,.194-.257,.356s.104,.305,.257,.356l.946,.315,.316,.947c.051,.153,.194,.256,.355,.256s.305-.104,.355-.256l.316-.947,.946-.315c.153-.051,.257-.194,.257-.356s-.104-.305-.257-.356Z"
          className="fill-current"
        />
        <line
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          x1="2.053"
          x2="15.951"
          y1="6.75"
          y2="6.75"
        />
        <polyline
          points="7.88 3.25 6.057 6.75 8.765 15.723"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <polyline
          points="10.12 3.25 11.943 6.75 9.235 15.723"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
        <circle cx="1.75" cy="2.25" r=".75" className="fill-current" />
      </g>
    </svg>
  );
};

export default GemSparkle;

import React from "react";

interface RocketProps extends React.SVGProps<SVGSVGElement> {
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
  className?: string;
}

function Rocket({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  className = "",
  ...props
}: RocketProps) {
  const secondaryFillColor = secondaryfill || fill;

  return (
    <svg
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-6 h-6 ${className}`}
      {...props}
    >
      <g>
        <path
          d="m4.981,3.405l.032-.056h-1.579c-.316,0-.615.144-.812.391l-1.872,2.344,2.366.566c.329-1.198.951-2.308,1.865-3.245Z"
          className={`fill-current text-${fill}`}
        />
        <path
          d="m8.595,7.019l.056-.032v1.579c0,.316-.144.615-.391.812l-2.344,1.872-.566-2.366c1.198-.329,2.308-.951,3.245-1.865Z"
          className={`fill-current text-${fill}`}
        />
        <path
          d="m3.25,10.481c-.205.453-.662.769-1.192.769H.75v-1.307c0-.53.315-.987.769-1.192"
          fill="none"
          className={`stroke-current text-${secondaryFillColor}`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m5.013,3.349h-1.579c-.316,0-.615.144-.812.391l-1.872,2.344,2.366.566"
          fill="none"
          className={`stroke-current text-${fill}`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m8.651,6.987v1.579c0,.316-.144.615-.391.812l-2.344,1.872-.566-2.366"
          fill="none"
          className={`stroke-current text-${fill}`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="m5.351,8.884c2.995-.823,5.491-3.381,5.899-8.134C6.497,1.159,3.939,3.655,3.116,6.649l2.234,2.234Z"
          fill="none"
          className={`stroke-current text-${fill}`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <circle
          cx="7.75"
          cy="4.25"
          className={`fill-current text-${secondaryFillColor}`}
          r=".75"
        />
      </g>
    </svg>
  );
}

export default Rocket;

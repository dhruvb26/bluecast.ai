import React from "react";

interface RocketOutlineProps extends React.SVGProps<SVGSVGElement> {
  fill?: string;
  secondaryfill?: string;
  strokewidth?: number;
}

const RocketOutline: React.FC<RocketOutlineProps> = ({
  fill = "currentColor",
  secondaryfill,
  strokewidth = 1,
  className,
  ...props
}) => {
  const secondaryFillColor = secondaryfill || fill;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      className={className}
      {...props}
    >
      <g fill={fill}>
        <path
          d="M13.035 10.418C16.69 6.58298 16.243 2.11298 16.205 1.79498C15.886 1.75698 11.417 1.30998 7.582 4.96498C5.259 7.17898 4.477 9.65098 4.25 10.478L7.522 13.75C8.349 13.523 10.821 12.741 13.035 10.418Z"
          fill={secondaryFillColor}
          fillOpacity="0.3"
          stroke="none"
        />
        <path
          d="M13.035 10.418C16.69 6.58301 16.243 2.11301 16.205 1.79501C15.886 1.75701 11.417 1.31001 7.582 4.96501C5.259 7.17901 4.477 9.65101 4.25 10.478L7.522 13.75C8.349 13.523 10.821 12.741 13.035 10.418Z"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M11.25 8.5C12.2165 8.5 13 7.7165 13 6.75C13 5.7835 12.2165 5 11.25 5C10.2835 5 9.5 5.7835 9.5 6.75C9.5 7.7165 10.2835 8.5 11.25 8.5Z"
          fill={fill}
          stroke="none"
        />
        <path
          d="M5.104 15.218C4.829 15.826 4.216 16.25 3.505 16.25H1.75V14.496C1.75 13.785 2.173 13.172 2.782 12.897"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M12.972 10.484L13.218 11.861C13.442 13.114 12.922 14.384 11.884 15.119L9.22998 17C9.22998 17 9.87298 15.319 9.50898 12.995"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
        <path
          d="M7.516 5.02798L6.142 4.78199C4.887 4.55699 3.615 5.07798 2.878 6.11898L1 8.76999C1 8.76999 2.681 8.12699 5.005 8.49099"
          fill="none"
          stroke={fill}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokewidth}
        />
      </g>
    </svg>
  );
};

export default RocketOutline;

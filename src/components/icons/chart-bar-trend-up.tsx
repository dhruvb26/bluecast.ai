import React from "react";
import { cn } from "@/lib/utils";

interface ChartBarTrendUpProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

function ChartBarTrendUp({ className, ...props }: ChartBarTrendUpProps) {
  return (
    <svg
      className={cn("w-6 h-6", className)}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g className="fill-current">
        <rect height="14" width="4" rx="1.75" ry="1.75" x="12.5" y="2" />
        <rect height="9" width="4" rx="1.75" ry="1.75" x="7" y="7" />
        <rect height="5" width="4" rx="1.75" ry="1.75" x="1.5" y="11" />
        <path d="M2.75,9.5c.192,0,.384-.073,.53-.22l4.72-4.72v.689c0,.414,.336,.75,.75,.75s.75-.336,.75-.75V2.75c0-.414-.336-.75-.75-.75h-2.5c-.414,0-.75,.336-.75,.75s.336,.75,.75,.75h.689L2.22,8.22c-.293,.293-.293,.768,0,1.061,.146,.146,.338,.22,.53,.22Z" />
      </g>
    </svg>
  );
}

export default ChartBarTrendUp;
import React from "react";
import { cn } from "@/lib/utils";

interface LightbulbProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

function Lightbulb({ className, ...props }: LightbulbProps) {
  return (
    <svg
      className={cn("w-6 h-6", className)}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g className="fill-current">
        <path
          className="text-current opacity-30"
          d="M9,2.5c-.414,0-.75-.336-.75-.75V.75c0-.414,.336-.75,.75-.75s.75,.336,.75,.75V1.75c0,.414-.336,.75-.75,.75Z"
        />
        <path
          className="text-current opacity-30"
          d="M14.126,4.624c-.192,0-.384-.073-.53-.22-.293-.293-.293-.768,0-1.061l.707-.707c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061l-.707,.707c-.146,.146-.338,.22-.53,.22Z"
        />
        <path
          className="text-current opacity-30"
          d="M17.25,9.75h-1c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75h1c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"
        />
        <path
          className="text-current opacity-30"
          d="M3.874,4.624c-.192,0-.384-.073-.53-.22l-.707-.707c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l.707,.707c.293,.293,.293,.768,0,1.061-.146,.146-.338,.22-.53,.22Z"
        />
        <path
          className="text-current opacity-30"
          d="M1.75,9.75H.75c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75H1.75c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"
        />
        <path
          className="text-current"
          d="M12.466,4.729c-1.293-1.05-2.987-1.454-4.647-1.105-2.178,.456-3.884,2.247-4.244,4.458-.393,2.411,.797,4.728,2.925,5.809v1.859c0,.965,.785,1.75,1.75,1.75h1.5c.965,0,1.75-.785,1.75-1.75v-1.859c1.838-.934,3-2.802,3-4.891,0-1.664-.742-3.221-2.034-4.271Zm-2.716,11.271h-1.5c-.138,0-.25-.112-.25-.25v-1.75h2v1.75c0,.138-.112,.25-.25,.25Z"
        />
      </g>
    </svg>
  );
}

export default Lightbulb;

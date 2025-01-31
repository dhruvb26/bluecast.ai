"use client";

import { Toaster } from "sonner";
import SuccessIcon from "@/components/icons/success-icon";
import ErrorIcon from "@/components/icons/error-icon";
import InfoIcon from "@/components/icons/info-icon";

export function ToasterProvider() {
  return (
    <Toaster
      className="ml-0 mr-0"
      position="top-right"
      offset={32}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex flex-row mt-6 justify-start space-x-5 border border-input items-center w-full p-4 text-gray-900 bg-white rounded-md shadow-sm",
          title: "text-sm font-normal",
        },
      }}
      icons={{
        success: <SuccessIcon />,
        error: <ErrorIcon />,
        info: <InfoIcon />,
      }}
    />
  );
}

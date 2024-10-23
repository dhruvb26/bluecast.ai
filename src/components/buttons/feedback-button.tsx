import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Chat } from "@phosphor-icons/react/dist/ssr";

const FeedbackButton: React.FC = () => {
  return (
    <Link
      target="_blank"
      href="https://bluecast.canny.io/feedback"
      passHref
      className="hover:shadow-sm"
    >
      <Button className="z-50 fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 ease-in-out">
        <Chat size={35} weight="fill" />
      </Button>
    </Link>
  );
};

export default FeedbackButton;

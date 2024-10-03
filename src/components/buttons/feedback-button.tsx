import React from "react";
import Link from "next/link";
import { FaCommentAlt } from "react-icons/fa";
import { Button } from "../ui/button";

const FeedbackButton: React.FC = () => {
  return (
    <Link
      target="_blank"
      href="https://bluecast.canny.io/feedback"
      passHref
      className="hover:shadow-sm"
    >
      <Button className="fixed bottom-5 right-5 rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-colors duration-200 ease-in-out">
        <FaCommentAlt size={25} />
      </Button>
    </Link>
  );
};

export default FeedbackButton;

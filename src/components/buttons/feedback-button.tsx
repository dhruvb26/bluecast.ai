import React from "react";
import Link from "next/link";
import { FaCommentAlt } from "react-icons/fa";

const FeedbackButton: React.FC = () => {
  return (
    <Link
      href="https://bluecast.canny.io/feature-requests"
      passHref
      className="hover:shadow-sm"
    >
      <button className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-colors duration-200 ease-in-out">
        <FaCommentAlt size={20} />
      </button>
    </Link>
  );
};

export default FeedbackButton;

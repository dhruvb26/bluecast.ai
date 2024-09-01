"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface LinkedInSignInButtonProps {
  buttonText: string;
  className?: string;
}

export const LinkedInSignInButton = ({
  buttonText,
  className,
}: LinkedInSignInButtonProps) => {
  const handleLinkedInSignIn = () => {
    try {
      signIn("linkedin", {
        callbackUrl: `/onboarding`,
        redirect: true,
      });
    } catch (error) {
      console.error("Error signing in with LinkedIn", error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLinkedInSignIn}
      className={className}
    >
      <Image
        src="/icons/linkedin.svg"
        width={20}
        height={20}
        alt="LinkedIn Logo"
        className="mr-2"
      />
      {buttonText}
    </Button>
  );
};

"use client";

import { Button } from "../ui/button";
import Image from "next/image";
import { env } from "@/env";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLinkedInId } from "@/actions/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LinkedInSignInButtonProps {
  buttonText: string;
}

export default function LinkedInSignInButton({
  buttonText,
}: LinkedInSignInButtonProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();
  const clientId = "78htulmwcx0u3e";
  const redirectUri = encodeURIComponent(
    `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/linkedin`
  );
  const state = "foobar";
  const scope = "openid%20profile%20email%20w_member_social%20r_basicprofile";
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

  const handleLinkedInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Open popup
    const popup = window.open(
      authUrl,
      "LinkedIn Login",
      "width=600,height=700"
    );

    // Handle popup close and redirect
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        // Check current URL to see if we need to redirect
        if (window.location.pathname !== "/settings") {
          router.push("/settings");
        }
      }
    }, 500);
  };

  useEffect(() => {
    const checkLinkedInAccount = async () => {
      try {
        const linkedInAccount = await getLinkedInId();
        if (linkedInAccount && linkedInAccount.length > 0) {
          const account = linkedInAccount[0];
          const expiresAt = account.expires_at;
          setIsDisabled(!!expiresAt && new Date(expiresAt) > new Date());
        } else {
          setIsDisabled(false);
        }
      } catch (error) {
        console.error("Error checking LinkedIn account:", error);
        setIsDisabled(false);
      }
    };

    // Listen for the custom error event from the OAuth callback
    const handleOAuthError = (event: MessageEvent) => {
      if (
        event.data.type === "oauth-error" &&
        event.data.provider === "linkedin"
      ) {
        toast.error(
          "This LinkedIn account is already connected to another user."
        );
      }
    };

    window.addEventListener("message", handleOAuthError);
    checkLinkedInAccount();

    return () => {
      window.removeEventListener("message", handleOAuthError);
    };
  }, [toast]);

  return (
    <Button
      variant={"outline"}
      onClick={handleLinkedInClick}
      disabled={isDisabled}
    >
      <Image
        src="/icons/linkedin.svg"
        width={20}
        height={20}
        alt="LinkedIn Logo"
        className="mr-2"
      />
      <span>{isDisabled ? "Connected" : buttonText}</span>
    </Button>
  );
}

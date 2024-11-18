"use client";

import { Button } from "../ui/button";
import Image from "next/image";
import { env } from "@/env";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLinkedInId } from "@/actions/user";

interface LinkedInSignInButtonProps {
  buttonText: string;
}

export default function LinkedInSignInButton({
  buttonText,
}: LinkedInSignInButtonProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const clientId = "78htulmwcx0u3e";
  const redirectUri = encodeURIComponent(
    `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/linkedin`
  );
  const state = "foobar";
  const scope = "openid%20profile%20email%20w_member_social%20r_basicprofile";
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

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

    checkLinkedInAccount();
  }, []);

  return (
    <Button variant={"outline"} disabled={isDisabled}>
      <Image
        src="/icons/linkedin.svg"
        width={20}
        height={20}
        alt="LinkedIn Logo"
        className="mr-2"
      />
      <Link target="_blank" href={authUrl}>
        {isDisabled ? "Connected" : buttonText}
      </Link>
    </Button>
  );
}

"use client";

import { Button } from "../ui/button";
import Image from "next/image";
import { env } from "@/env";
import Link from "next/link";

interface LinkedInSignInButtonProps {
  buttonText: string;
}

export default function LinkedInSignInButton({
  buttonText,
}: LinkedInSignInButtonProps) {
  const clientId = "78htulmwcx0u3e";
  const redirectUri = encodeURIComponent(
    "http://localhost:3000/api/auth/callback/linkedin"
  );
  const state = "foobar";
  const scope = "openid%20profile%20email%20w_member_social%20r_basicprofile";
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

  return (
    <Button variant={"outline"}>
      <Image
        src="/icons/linkedin.svg"
        width={20}
        height={20}
        alt="LinkedIn Logo"
        className="mr-2"
      />
      <Link target="_blank" href={authUrl}>
        {buttonText}
      </Link>
    </Button>
  );
}

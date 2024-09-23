"use client";

import { Button } from "../ui/button";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/env";
import { useRouter } from "next/navigation";

interface LinkedInSignInButtonProps {
  buttonText: string;
}

export default function LinkedInSignInButton({
  buttonText,
}: LinkedInSignInButtonProps) {
  const router = useRouter();
  const id = uuidv4();
  const handleLinkedInSignIn = () => {
    try {
      const clientId = env.LINKEDIN_CLIENT_ID;
      const redirectUri = encodeURIComponent(env.CALLBACK_URL);
      const state = "foobar";
      const scope =
        "openid%20profile%20email%20w_member_social%20r_basicprofile";

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78htulmwcx0u3e&redirect_uri=http://localhost:3000/api/auth/callback/linkedin&state=foobar&scope=openid%20email%20profile%20w_member_social%20r_basicprofile`;

      router.push(authUrl);
    } catch (error) {
      console.error("Error initiating LinkedIn sign in", error);
    }
  };

  return (
    <Button
      onClick={handleLinkedInSignIn}
      className="group flex w-full select-none items-center justify-center rounded-lg border border-zinc-50 bg-white leading-8 text-zinc-950 shadow-[0_-1px_0_0px_#d4d4d8_inset,0_0_0_1px_#f4f4f5_inset,0_0.5px_0_1.5px_#fff_inset] hover:bg-zinc-50 hover:via-zinc-900 hover:to-zinc-800 active:shadow-[-1px_0px_1px_0px_#e4e4e7_inset,1px_0px_1px_0px_#e4e4e7_inset,0px_0.125rem_1px_0px_#d4d4d8_inset]"
    >
      <Image
        src="/linkedin.svg"
        width={20}
        height={20}
        alt="LinkedIn Logo"
        className="mr-2"
      />
      {buttonText}
    </Button>
  );
}

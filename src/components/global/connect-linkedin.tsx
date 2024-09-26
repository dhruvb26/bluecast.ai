import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { Button } from "../ui/button";
import Image from "next/image";
import { usePostStore } from "@/store/post";
import { env } from "@/env";
import Link from "next/link";
const LinkedInConnect = () => {
  const clientId = "78htulmwcx0u3e";
  const redirectUri = encodeURIComponent(
    `${env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/linkedin`
  );
  const state = "foobar";
  const scope = "openid%20profile%20email%20w_member_social%20r_basicprofile";
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

  const { showLinkedInConnect, setShowLinkedInConnect } = usePostStore();
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center">
          <Image
            src="/images/connect-linkedin.png"
            alt="Illustration"
            width={350}
            height={350}
          />
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Connect LinkedIn Account
        </CardTitle>
        <CardDescription>
          <p className="text-muted-foreground text-sm">
            Link your LinkedIn account to seamlessly schedule posts, publish
            content, and attach files.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-x-2 flex flex-row items-center justify-center">
          <Button className="w-full" size="lg">
            <Link href={authUrl} target="_blank">
              <Image
                src="/icons/linkedin-white.svg"
                alt="LinkedIn icon"
                className="mr-1"
                width={17}
                height={17}
              />
              Connect LinkedIn
            </Link>
          </Button>
          <Button
            onClick={() => setShowLinkedInConnect(false)}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Do It Later
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          You will be redirected to LinkedIn to connect your account.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LinkedInConnect;

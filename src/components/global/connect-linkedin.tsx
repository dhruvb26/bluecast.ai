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
const LinkedInConnect = () => {
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
            Connect your LinkedIn account to schedule and publish post.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-x-2 flex flex-row items-center justify-center">
          <Button className="w-full" size="lg">
            <Image
              src="/icons/linkedin-white.svg"
              alt="LinkedIn icon"
              className="mr-1"
              width={17}
              height={17}
            />
            Connect LinkedIn
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

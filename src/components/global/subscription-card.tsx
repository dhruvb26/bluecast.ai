import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { env } from "@/env";
import { Button } from "../ui/button";
import Image from "next/image";
import { usePostStore } from "@/store/post";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
const SubscriptionCard = () => {
  const { user } = useUser();
  const { setShowFeatureGate } = usePostStore();
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center">
          <Image
            src="/images/unlock.png"
            alt="Illustration"
            width={350}
            height={350}
          />
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          Unlock Premium Feature
        </CardTitle>
        <CardDescription>
          <p className="text-muted-foreground text-sm">
            Subscribe to one of our plans and get access to this premium
            feature.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-x-2 flex flex-row items-center justify-center">
          <Button className="w-full" size="lg">
            <Link href={"/pricing"}>Upgrade Plan</Link>
          </Button>
          <Button
            onClick={() => setShowFeatureGate(false)}
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
          You will be redirected to the payments page.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;

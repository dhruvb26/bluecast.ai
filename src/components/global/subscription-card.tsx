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
const SubscriptionCard = () => {
  const { showFeatureGate, setShowFeatureGate } = usePostStore();
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
            <Link
              target="_blank"
              href={
                env.NEXT_PUBLIC_NODE_ENV === "development"
                  ? "https://buy.stripe.com/test_3cs16B3DI68Ycve001"
                  : "https://buy.stripe.com/eVa7uTcgf4YP0kU8ww"
              }
            >
              Take me there
            </Link>
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

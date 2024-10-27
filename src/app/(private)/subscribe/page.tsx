"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Subscription = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md space-y-1 rounded-lg bg-white px-8 py-6 text-center flex flex-col items-center justify-center shadow-lg">
        <Image
          src="/brand/Bluecast Logo.png"
          height={165}
          width={165}
          alt="Bluecast Logo"
        />

        <Image
          src="/images/subscription.png"
          height={300}
          width={300}
          alt="Bluecast Logo"
          className="mb-2"
        />
        <h1 className="text-2xl font-semibold tracking-tight">
          Your free trial has expired!
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">
          To continue using our service, please subscribe to one of our plans &
          continue growing on LinkedIn.
        </p>

        <div className="flex flex-row w-full  justify-center items-center space-x-2">
          {/* <Button className="w-full" variant={"outline"}>
            <Link href="https://www.bluecast.ai/pricing" target="_blank">
              View Pricing
            </Link>
          </Button> */}
          <Button className="group w-full my-5">
            <Link className="group" href={"/pricing"}>
              Upgrade Plan
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          If you want to learn more about the features and what we offer, please
          reach out to{" "}
          <Link
            href="mailto:support@bluecast.ai"
            className="text-blue-600 hover:underline"
          >
            support@bluecast.ai
          </Link>{" "}
          to get a free demo.
        </p>
      </div>
    </div>
  );
};

export default Subscription;

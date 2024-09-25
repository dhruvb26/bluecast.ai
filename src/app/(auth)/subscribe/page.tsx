"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { env } from "@/env";

const Subscription = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center flex flex-col items-center justify-center shadow-lg">
        <Image
          src="/brand/Bluecast Logo.png"
          height={150}
          width={150}
          alt="Bluecast Logo"
          className="mb-2"
        />

        <Image
          src="/images/subscription.png"
          height={300}
          width={300}
          alt="Bluecast Logo"
          className="mb-2"
        />

        <p className="mb-6 text-sm">
          To continue using our service, please subscribe to our launch plan &
          continue growing on LinkedIn.
        </p>

        <div className="flex flex-row w-full  justify-center items-center space-x-2">
          <Button className="w-full" variant={"outline"}>
            <Link href="https://www.bluecast.ai/pricing" target="_blank">
              View Pricing
            </Link>
          </Button>
          <Button className="group w-full">
            <Link
              className="group"
              target="_blank"
              href={
                env.NEXT_PUBLIC_NODE_ENV === "development"
                  ? "https://buy.stripe.com/test_fZe5l61pNfrWdOg7ss"
                  : "https://buy.stripe.com/eVa7uTcgf4YP0kU8ww"
              }
            >
              Subscribe
              <ArrowUpRight
                size={16}
                className="inline transition-transform group-hover:translate-y-[-2px] group-hover:translate-x-[2px]"
              />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

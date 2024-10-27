"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export const GridCards = () => {
  return (
    <div className="w-7xl mx-auto grid max-w-full grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="col-span-1 transition-all hover:-translate-y-1 hover:shadow-sm overflow-hidden">
        <CardContent className="p-6 relative h-full">
          <Link
            href={"https://www.bluecast.ai/blog-template"}
            target="_blank"
            className="block h-full"
          >
            <div className="flex flex-col h-full items-center justify-center">
              <div className="mb-4 flex-shrink-0 flex items-center justify-center w-full">
                <Image
                  src="/icons/blog1.png"
                  width={65}
                  height={65}
                  alt="Blog 1"
                  className="object-contain"
                />
              </div>
              <h2 className="text-balance text-center text-lg font-semibold mb-2 tracking-tight">
                How to build a successful LinkedIn content strategy in 2024
              </h2>
              <p className="text-center text-sm text-muted-foreground">
                Discover the best practices to create an effective LinkedIn
                content strategy for 2024.
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
      <Card className="col-span-1 transition-all hover:-translate-y-1 hover:shadow-sm overflow-hidden">
        <CardContent className="p-6 relative h-full">
          <Link
            href={"https://www.bluecast.ai/blog-template-2"}
            target="_blank"
            className="block h-full"
          >
            <div className="flex flex-col h-full items-center justify-center">
              <div className="mb-4 flex-shrink-0 flex items-center justify-center w-full">
                <Image
                  src="/icons/blog2.png"
                  width={65}
                  height={65}
                  alt="Blog 2"
                  className="object-contain"
                />
              </div>
              <h2 className="text-balance text-center text-lg font-semibold mb-2 tracking-tight">
                5 Powerful Hook Strategies for LinkedIn
              </h2>
              <p className="text-center text-sm text-muted-foreground">
                Learn five effective hook strategies to capture attention and
                engage your LinkedIn audience.
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
      <Card className="col-span-1 transition-all hover:-translate-y-1 hover:shadow-sm overflow-hidden">
        <CardContent className="p-6 relative h-full">
          <Link
            href={"https://www.bluecast.ai/blog-template-3"}
            target="_blank"
            className="block h-full"
          >
            <div className="flex flex-col h-full items-center justify-center">
              <div className="mb-4 flex-shrink-0 flex items-center justify-center w-full">
                <Image
                  src="/icons/blog3.png"
                  width={65}
                  height={65}
                  alt="Blog 3"
                  className="object-contain"
                />
              </div>
              <h2 className="text-balance text-center text-lg font-semibold mb-2 tracking-tight">
                Top 7 Frameworks for Growing Your Personal Brand on LinkedIn
              </h2>
              <p className="text-center text-sm text-muted-foreground">
                Discover the top frameworks that can help you effectively grow
                and manage your personal brand on LinkedIn.
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

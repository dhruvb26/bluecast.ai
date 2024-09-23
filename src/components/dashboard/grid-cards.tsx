"use client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export const GridCards = () => {
  return (
    <div className="w-7xl mx-auto grid max-w-full grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-2 h-full transition-all hover:-translate-y-1 hover:shadow-sm overflow-hidden">
        <CardContent className="p-6 relative h-full">
          <Link
            href={"https://www.spireo.ai/"}
            target="_blank"
            className="block h-full"
          >
            <div className="flex flex-col h-full">
              <h2 className="text-balance text-left text-lg font-semibold tracking-tight md:text-xl mb-4">
                AI-Powered LinkedIn Growth Tools
              </h2>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between flex-grow">
                <div className="max-w-xs lg:max-w-sm">
                  <p className="text-left text-sm text-muted-foreground">
                    Spireo offers cutting-edge AI features to supercharge your
                    LinkedIn presence. From content creation to engagement
                    analysis, our tools help you grow your network effectively.
                  </p>
                </div>
                <div className="mt-4 lg:mt-0 lg:ml-4 flex-shrink-0">
                  <Image
                    src="/images/features.png"
                    width={350}
                    height={350}
                    alt="AI-powered growth tools"
                    className="rounded-2xl object-contain"
                  />
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
      <Card className="col-span-1 transition-all hover:-translate-y-1 hover:shadow-sm overflow-hidden">
        <CardContent className="p-6 relative h-full">
          <Link
            href={"https://spireo.canny.io/feature-requests"}
            target="_blank"
            className="block h-full"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="max-w-80 text-balance text-left text-lg font-semibold tracking-tight md:text-xl">
                  We Value Your Feedback
                </h2>
                <p className="mt-4 max-w-[14rem] text-balance text-left text-sm text-muted-foreground">
                  Have ideas for new features? We're all ears!
                </p>
              </div>
              <div className="mt-4">
                <Image
                  src="/images/feedback.png"
                  width={225}
                  height={225}
                  alt="Feedback and feature requests"
                  className="rounded-2xl object-contain"
                />
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
      <Card className="col-span-1 lg:col-span-3 transition-all hover:-translate-y-1 hover:shadow-sm overflow-hidden">
        <CardContent className="p-6 relative h-full">
          <Link
            href={"https://www.spireo.ai/blog-template"}
            target="_blank"
            className="block h-full"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="max-w-3xl lg:max-w-2xl">
                <h2 className="text-balance text-left text-lg font-semibold tracking-tight md:text-xl">
                  Learn to Master Spireo
                </h2>
                <p className="mt-4 text-left text-sm text-muted-foreground">
                  Explore our comprehensive blogs and in-depth video tutorials
                  to unlock the full potential of Spireo. Discover expert tips,
                  proven strategies, and industry best practices for
                  accelerating your LinkedIn growth. Our regularly updated
                  content covers everything from optimizing your profile to
                  crafting engaging posts and building meaningful connections.
                </p>
                <p className="mt-2 text-left text-sm text-muted-foreground">
                  Whether you're a LinkedIn novice or a seasoned professional,
                  our learning resources are designed to help you stay ahead of
                  the curve.
                </p>
              </div>
              <div className="mt-4 lg:mt-0 lg:ml-4 flex-shrink-0">
                <Image
                  src="/images/tutorials.png"
                  width={300}
                  height={300}
                  alt="Blogs and tutorials"
                  className="rounded-2xl object-contain"
                />
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

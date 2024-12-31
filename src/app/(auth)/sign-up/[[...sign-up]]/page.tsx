"use client";

import AvatarCircles from "@/components/magicui/avatar-circles";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Metadata } from "next";
import { useSearchParams } from "next/navigation";

const metadata: Metadata = {
  title: "LinkedIn Growth Made Easy | Bluecast Sign Up",
  description:
    "Sign up for Bluecast to enhance your LinkedIn presence with AI-powered tools. Sign up now to streamline your LinkedIn strategy and grow your network effortlessly.",
  keywords:
    "LinkedIn, AI tools, Bluecast, sign up, professional growth, network",
};

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const isInvited = searchParams.get("invited") === "true";

  const avatarUrls = [
    "https://utfs.io/f/Hny9aU7MkSTDiiOBuu37vEqg4NkAFcsWxz1D9T6u2yLldmRt",
    "https://utfs.io/f/Hny9aU7MkSTDIMFr0VALb1UPgqefS7Jc58iIph4o9waMTCGx",
    "https://utfs.io/f/Hny9aU7MkSTD7IM5Xt2GWpXEGYV0ShTBZOxvQl35UaiqM4jJ",
    "https://utfs.io/f/Hny9aU7MkSTDWgaJy4V8ftSPjm7p9E2NaJMVQH1Gek5CXL3F",
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full flex-col md:flex-row">
        <div className="flex flex-1 flex-col justify-center bg-brand-blue-secondary px-4 py-8 md:px-8 md:py-12">
          <h1 className="mb-4 text-3xl md:text-5xl text-center md:text-left font-bold tracking-tight text-white">
            {isInvited
              ? "You've been invited to join a workspace"
              : "Boost your LinkedIn presence with AI"}
          </h1>
          <p className="mb-8 text-sm md:text-base md:text-left text-center font-normal text-blue-200">
            Bluecast's AI-powered tools streamline your LinkedIn strategy,
            helping you create impactful posts in minutes, not hours. Boost your
            professional presence and grow your network with ease.
          </p>
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <AvatarCircles avatarUrls={avatarUrls} />
            <div className="hidden lg:block h-10 w-px bg-white"></div>
            <span className="text-xs md:text-sm text-white text-center lg:text-left">
              Trusted by founders, marketers, and other LinkedIn experts
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col bg-white px-14 py-8">
          <div className="flex items-center justify-center h-full flex-col space-y-2">
            <SignUp
              appearance={{
                elements: {
                  logoImage: "h-10 w-full",
                  rootBox: "p-0",
                  cardBox: "shadow-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  footer: "hidden",
                  formButtonPrimary: "bg-foreground",
                },
              }}
            />
            <span className="text-xs md:text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant={"link"}
                className="px-0 text-foreground hover:text-foreground hover:underline group"
              >
                <Link href={"/sign-in"}>Sign in</Link>
              </Button>
            </span>
            <span className="text-xs md:text-sm text-center">
              By connecting, you agree to our{" "}
              <Button variant={"link"} className="px-0">
                <Link href={"https://www.bluecast.ai/terms-of-service"}>
                  Terms of Service
                </Link>
              </Button>{" "}
              and{" "}
              <Button className="px-0" variant={"link"}>
                <Link href={"https://www.bluecast.ai/privacy-policy"}>
                  Privacy Policy.
                </Link>
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

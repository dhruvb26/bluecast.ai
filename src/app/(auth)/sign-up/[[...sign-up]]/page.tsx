"use client";
import Image from "next/image";
import AvatarCircles from "@/components/magicui/avatar-circles";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUpPage() {
  const avatarUrls = [
    "https://media.licdn.com/dms/image/D5603AQE1mcDQhAvINg/profile-displayphoto-shrink_100_100/0/1722469152073?e=2147483647&v=beta&t=DohYF7jtDgmhP-thFsuSZrnpUL7-c5s3k6pPdxPGB4s",
    "https://media.licdn.com/dms/image/v2/D5603AQGLAtH5GgPm4w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1679939089348?e=1732147200&v=beta&t=IfFu5Wl2uXJ5VjpAg_BZFvpkLa2bq5kRBP_9IfeIgt4",
    "https://media.licdn.com/dms/image/D5603AQHsrYyK_hD5uQ/profile-displayphoto-shrink_100_100/0/1699974393415?e=2147483647&v=beta&t=NtL20it-fetquWmZkYZ3-Ryeljz2uLz2N4Ht05MrCuQ",
    "https://media.licdn.com/dms/image/v2/D5603AQHYENPGn3m5DQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1682725967530?e=1732147200&v=beta&t=_obCXYmwSZUAsEDkRVdIetMnuYF_kauBAbkvQ_thLxY",
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full flex-col md:flex-row">
        <div className="flex flex-1 flex-col justify-center bg-brand-blue-secondary px-4 py-8 md:px-8 md:py-12">
          <h2 className="mb-4 text-3xl md:text-5xl text-center md:text-left font-bold tracking-tight text-white">
            Boost your LinkedIn presence with AI
          </h2>
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

"use client";
import Image from "next/image";
import AvatarCircles from "@/components/magicui/avatar-circles";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const avatarUrls = [
    "https://media.licdn.com/dms/image/D5603AQE1mcDQhAvINg/profile-displayphoto-shrink_100_100/0/1722469152073?e=2147483647&v=beta&t=DohYF7jtDgmhP-thFsuSZrnpUL7-c5s3k6pPdxPGB4s",
    "https://media.licdn.com/dms/image/v2/D5603AQGLAtH5GgPm4w/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1679939089348?e=1732147200&v=beta&t=IfFu5Wl2uXJ5VjpAg_BZFvpkLa2bq5kRBP_9IfeIgt4",
    "https://media.licdn.com/dms/image/D5603AQHsrYyK_hD5uQ/profile-displayphoto-shrink_100_100/0/1699974393415?e=2147483647&v=beta&t=NtL20it-fetquWmZkYZ3-Ryeljz2uLz2N4Ht05MrCuQ",
    "https://media.licdn.com/dms/image/v2/D5603AQHYENPGn3m5DQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1682725967530?e=1732147200&v=beta&t=_obCXYmwSZUAsEDkRVdIetMnuYF_kauBAbkvQ_thLxY",
  ];

  const linkedInAuthUrl =
    "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=78htulmwcx0u3e&redirect_uri=http://localhost:3000/api/auth/callback/linkedin&state=foobar&scope=openid%20email%20profile%20w_member_social%20r_basicprofile";

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full">
        <div className="flex flex-1 flex-col justify-center bg-brand-blue-secondary px-8 py-12">
          <h2 className="mb-4 text-5xl font-bold tracking-tight text-white">
            Boost your LinkedIn presence with AI
          </h2>
          <p className="mb-8 text-base font-normal text-blue-200">
            Bluecast's AI-powered tools streamline your LinkedIn strategy,
            helping you create impactful posts in minutes, not hours. Boost your
            professional presence and grow your network with ease.
          </p>
          <div className="flex items-center">
            <AvatarCircles avatarUrls={avatarUrls} />
            <div className="ml-2 h-10 w-px bg-white"></div>
            <span className="ml-2 text-sm text-white">
              Trusted by founders, marketers, and other LinkedIn experts
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col bg-white px-14 py-8">
          <div className="flex items-center justify-center h-full flex-col space-y-2">
            <Image
              src={"/brand/Bluecast Logo.png"}
              width={200}
              height={200}
              alt=""
            />{" "}
            <SignUp
              appearance={{
                elements: {
                  rootBox: "p-0",
                  cardBox: "shadow-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  footer: "hidden",
                  formButtonPrimary: "bg-foreground",
                },
              }}
            />
            <span className="text-sm">
              By connecting, you agree to our{" "}
              <Button variant={"link"} className="px-0">
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button className="px-0" variant={"link"}>
                Privacy Policy.
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

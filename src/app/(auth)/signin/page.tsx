import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import AvatarCircles from "@/components/magicui/avatar-circles";
import { LinkedInSignInButton } from "@/components/auth/linkedin-signin-button";
import { Button } from "@/components/ui/button";

export default async function SignUp() {
  // const session = await getServerSession();

  // if (session) {
  //   redirect(`/dashboard`);
  // }

  const avatarUrls = [
    "https://media.licdn.com/dms/image/D5603AQE1mcDQhAvINg/profile-displayphoto-shrink_100_100/0/1722469152073?e=2147483647&v=beta&t=DohYF7jtDgmhP-thFsuSZrnpUL7-c5s3k6pPdxPGB4s",
    "https://media.licdn.com/dms/image/D4E03AQF3n1Kczlen4g/profile-displayphoto-shrink_100_100/0/1722972052685?e=2147483647&v=beta&t=Ta55nledgAReBnb7gq2gnuJQeYuP7fkzC7-YbU0BW0o",
    "https://media.licdn.com/dms/image/D5603AQHsrYyK_hD5uQ/profile-displayphoto-shrink_100_100/0/1699974393415?e=2147483647&v=beta&t=NtL20it-fetquWmZkYZ3-Ryeljz2uLz2N4Ht05MrCuQ",
    "https://media.licdn.com/dms/image/D5603AQHYENPGn3m5DQ/profile-displayphoto-shrink_100_100/0/1682725967530?e=2147483647&v=beta&t=SnLyF1unVqzDl7LJ3oglWmDTXVba-onTkZlRRDq4O-A",
  ];

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full">
        <div className="flex flex-1 flex-col bg-white px-14 py-8">
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <Image
                src="/brand/icon.png"
                width={32}
                height={32}
                alt="Flaro Logo"
              />
              <span className="ml-1 text-2xl font-bold tracking-tight">
                Spireo
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tighter">
              Login to Spireo
            </h1>
            <p className="text-gray-500 mb-8 text-sm">
              Lorem ipsum dolor sit amet, to the con adipiscing. Volutpat tempor
              to the condim entum.
            </p>

            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <div className="flex justify-between items-center">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-500">Remember Me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Button className="w-full" type="submit">
                Sign In
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <LinkedInSignInButton
                className="w-full"
                buttonText="Continue with LinkedIn"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center bg-blue-600 px-8 py-12">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">
            Boost your LinkedIn presence with AI
          </h2>
          <p className="mb-8 text-sm font-normal text-white">
            Spireo's AI-powered tools streamline your LinkedIn strategy, helping
            you create impactful posts in minutes, not hours. Boost your
            professional presence and grow your network with ease.
          </p>
          <div className="flex items-center">
            <AvatarCircles avatarUrls={avatarUrls} />
            <div className="ml-2 h-10 w-px bg-white"></div>
            <span className="ml-2 text-xs text-white">
              Trusted by founders, marketers, and other LinkedIn experts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

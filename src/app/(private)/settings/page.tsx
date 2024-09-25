import React from "react";
import Link from "next/link";
import {
  UserCircleCheck,
  ClockCounterClockwise,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { checkValidity, getUser } from "@/actions/user";
import { Input } from "@/components/ui/input";
import { eq } from "drizzle-orm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LinkedInSignInButton from "@/components/auth/linkedin-signin-button";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { env } from "@/env";
export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  const user = await getUser();
  const endsAt = (await checkValidity()) as Date;
  if (!user) return null;

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, user.id),
  });

  const provider = account?.provider;

  const specialAccess = user.specialAccess;
  const customerPortalLink =
    env.NEXT_PUBLIC_NODE_ENV === "development"
      ? "https://billing.stripe.com/p/login/test_bIYcPt7RJcPs3vicMM"
      : "https://billing.stripe.com/p/login/4gw9EzeXq3oe4N2dQQ";

  const formatDate = (date: Date) =>
    date ? format(new Date(date), "MMMM d, yyyy") : "Not available";

  const validityInfo = specialAccess ? (
    <Badge className="ml-auto space-x-1 bg-purple-50 font-normal text-purple-600 hover:bg-purple-100">
      <span>Special</span>
      <UserCircleCheck />
    </Badge>
  ) : (
    <Badge className="ml-auto space-x-1 bg-purple-50 font-normal text-purple-600 hover:bg-purple-100">
      <span>{formatDate(endsAt)}</span>
      <ClockCounterClockwise />
    </Badge>
  );

  return (
    <main className="p-8">
      <div className="space-y-16">
        <div className="text-left">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Account Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            See the information we gather about you and manage your
            subscription.
          </p>
        </div>
        <section className="flex space-x-4">
          <div className="w-1/3">
            <h2 className="text-md font-semibold tracking-tight text-foreground">
              Personal
            </h2>
            <p className="text-sm text-muted-foreground">
              We have obtained your name and email through LinkedIn.
            </p>
          </div>
          <div className="w-2/3 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <Input
                disabled
                type="text"
                id="name"
                defaultValue={user.name || ""}
                className="text-sm"
                placeholder="example.com/janesmith"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input
                disabled
                type="email"
                id="email"
                defaultValue={user.email || ""}
                className="text-sm"
              />
            </div>
          </div>
        </section>

        <section className="flex space-x-4">
          <div className="w-1/3">
            <h2 className="text-md font-semibold tracking-tight text-foreground">
              Account
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and billing details.
            </p>
            <div className="pr-8">
              <div className="mt-2 rounded-md bg-blue-100 p-4 text-left text-xs text-blue-600">
                <span>
                  To update your card, cancel your subscription, or make other
                  changes, please visit the{" "}
                  <Link
                    target="_blank"
                    className="hover:text-blue-700 hover:underline group"
                    href={`${customerPortalLink}?prefilled_email=${user.email}`}
                  >
                    {" "}
                    customer portal here{" "}
                    <ArrowUpRight
                      size={12}
                      className="inline transition-transform group-hover:translate-y-[-2px] group-hover:translate-x-[2px]"
                    />
                  </Link>
                </span>
              </div>
            </div>
          </div>
          <div className="w-2/3 space-y-4">
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-foreground">Access</h2>
              <Select disabled defaultValue="active">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-y-2 items-start justify-start flex-col">
              <h2 className="text-sm font-medium text-foreground">Validity</h2>
              <div className="text-sm text-gray-400">{validityInfo}</div>
            </div>
          </div>
        </section>
        <section className="flex space-x-4">
          <div className="w-1/3">
            <h2 className="text-md font-semibold tracking-tight text-foreground">
              LinkedIn
            </h2>
            <p className="text-sm text-muted-foreground">
              Connect your LinkedIn account to continue.
            </p>
          </div>
          <div className="flex w-2/3 items-center justify-start">
            {/* {provider === "linkedin" ? (
              <Button
                disabled
                className="flex items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-2 text-sm text-foreground shadow hover:bg-neutral-100"
              >
                <Image
                  src="/icons/linkedin.svg"
                  width={20}
                  height={20}
                  alt="LinkedIn Logo"
                  className="mr-2"
                />
                Connected
              </Button>
            ) : ( */}

            <LinkedInSignInButton buttonText="Connect LinkedIn" />
          </div>
        </section>
      </div>
    </main>
  );
};

export default SettingsPage;

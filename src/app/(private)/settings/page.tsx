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
import { Button } from "@/components/ui/button";
import DeleteAccountButton from "@/components/auth/delete-account-button";
import { Money } from "@phosphor-icons/react/dist/ssr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import UpdateProfilePictureButton from "@/components/buttons/update-profile-picture-button";
export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  const user = await getUser();
  const endsAt = (await checkValidity()) as Date;
  if (!user) return null;

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, user.id),
  });

  const provider = account?.provider;

  const hasSubscription =
    user.hasAccess &&
    user.stripeSubscriptionId &&
    user.stripeCustomerId &&
    user.priceId;

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
      <div className="space-y-12">
        <div className="text-left">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
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
              We have obtained your name and email through your login.
            </p>
          </div>
          <div className="w-2/3 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Image
              </label>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.image || ""} alt={user.name || ""} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <UpdateProfilePictureButton />
              </div>
            </div>
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
              Account Access
            </h2>
            <p className="text-sm text-muted-foreground">
              This is your current account access information.
            </p>
          </div>
          <div className="w-2/3 space-y-4">
            <div className="flex items-center justify-start space-x-4">
              <Select
                disabled
                defaultValue={user.hasAccess ? "Active" : "Inactive"}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">
                    {user.priceId === "price_1Q32GdRrqqSKPUNWN1sG48XI" ||
                    user.priceId === "price_1Q1VQ4RrqqSKPUNWMMbGj3yh"
                      ? "Annual Plan"
                      : user.priceId === "price_1Q32F1RrqqSKPUNWkMQXCrVC" ||
                        user.priceId === "price_1Pb0w5RrqqSKPUNWGX1T2G3O"
                      ? "Monthly Plan"
                      : "Active"}
                  </SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        <section className="flex space-x-4">
          <div className="w-1/3">
            <h2 className="text-md font-semibold tracking-tight text-foreground">
              Usage Limits
            </h2>
            <p className="text-sm text-muted-foreground">
              Here you can view your current usage limits for posts and words.
            </p>
          </div>
          <div className="w-[30%] space-y-4">
            <div className="flex flex-col">
              <span className="text-xs text-foreground">
                {user.specialAccess
                  ? `${user.generatedPosts || 0} / 10 posts`
                  : `${user.generatedWords || 0} / 50000 words`}
              </span>
              <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-1.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
                  style={{
                    width: `${
                      user.specialAccess
                        ? ((user.generatedPosts || 0) / 10) * 100
                        : ((user.generatedWords || 0) / 50000) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex space-x-4">
          <div className="w-1/3">
            <h2 className="text-md font-semibold tracking-tight text-foreground">
              {hasSubscription ? "Subscription" : "Pricing"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasSubscription
                ? "Manage your current subscription plan."
                : "Check out our different plans and what they offer."}
            </p>
          </div>
          <div className="flex w-2/3 items-center justify-start">
            <Link
              target="_blank"
              href={
                hasSubscription
                  ? env.NEXT_PUBLIC_NODE_ENV === "development"
                    ? "https://billing.stripe.com/p/login/test_aEU00F2YO3cF11eeUU"
                    : "https://billing.stripe.com/p/login/4gw9EzeXq3oe4N2dQQ"
                  : "/pricing"
              }
            >
              <Button variant={"outline"}>
                {hasSubscription ? "Manage Subscription" : "Pricing and Plans"}
              </Button>
            </Link>
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
            <LinkedInSignInButton buttonText="Connect LinkedIn" />
          </div>
        </section>
      </div>
    </main>
  );
};

export default SettingsPage;

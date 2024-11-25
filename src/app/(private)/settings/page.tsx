import React from "react";
import Link from "next/link";
import {
  UserCircleCheck,
  ClockCounterClockwise,
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
import { workspaces } from "@/server/db/schema";
import { env } from "@/env";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UpdateProfilePictureButton from "@/components/buttons/update-profile-picture-button";
import { auth } from "@clerk/nextjs/server";
import WorkspaceDialog from "@/components/auth/workspace-dialog";
import DeleteWorkspaceDialog from "@/components/auth/delete-workspace-dialog";
import WorkspaceUserNameDialog from "@/components/auth/workspace-user-name-dialog";

export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  const user = await getUser();
  const endsAt = (await checkValidity()) as Date;
  if (!user) return null;

  const { sessionClaims } = auth();
  const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
    | string
    | undefined;

  const workspace = workspaceId
    ? await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
      })
    : null;

  const userWorkspaces = await db.query.workspaces.findMany({
    where: eq(workspaces.userId, user.id),
  });

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

  // Determine usage and limits based on context
  const wordLimit = userWorkspaces.length > 0 ? 75000 : 50000;
  const currentUsage = user.specialAccess
    ? user.generatedPosts || 0
    : workspace
    ? workspace.usage || 0
    : user.generatedWords || 0;
  const usageLimit = user.specialAccess ? 10 : wordLimit;
  const usageText = user.specialAccess
    ? `${currentUsage} / 10 posts`
    : `${currentUsage} / ${wordLimit} words`;

  return (
    <main className="p-8">
      <div className="space-y-10">
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
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Personal
            </h2>
            <p className="text-sm text-muted-foreground">
              We have obtained your name and email through your login.
            </p>
          </div>
          <div className="w-1/3 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Image
              </label>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={
                      workspace
                        ? workspace.linkedInImageUrl || ""
                        : user.image || ""
                    }
                    alt={user.name || ""}
                  />
                  <AvatarFallback>
                    {workspace
                      ? workspace.linkedInName?.charAt(0) || ""
                      : user.name?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <UpdateProfilePictureButton />
              </div>
            </div>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  disabled
                  type="text"
                  id="name"
                  defaultValue={
                    workspace ? workspace.linkedInName || "" : user.name || ""
                  }
                  className="text-sm"
                  placeholder="example.com/janesmith"
                />
                {workspaceId && (
                  <WorkspaceUserNameDialog
                    workspaceId={workspaceId || ""}
                    currentLinkedInName={
                      workspace ? workspace.linkedInName || "" : ""
                    }
                  />
                )}
              </div>
            </div>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Workspace
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  disabled
                  type="text"
                  id="name"
                  defaultValue={workspace ? workspace.name || "" : ""}
                  className="text-sm"
                  placeholder="Default"
                />
                {workspaceId && (
                  <>
                    <WorkspaceDialog
                      workspaceId={workspaceId || ""}
                      currentName={workspace ? workspace.name || "" : ""}
                    />
                    <DeleteWorkspaceDialog
                      workspaceId={workspaceId || ""}
                      workspaceName={workspace ? workspace.name || "" : ""}
                    />
                  </>
                )}
              </div>
            </div>
            {/* <div>
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
            </div> */}
          </div>
        </section>

        <section className="flex space-x-4">
          <div className="w-1/3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
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
                    {user.priceId === "price_1QMOWRRrqqSKPUNWRV27Uiv7" ||
                    user.priceId === "price_1QN9MVRrqqSKPUNWHqv3bcMM"
                      ? "Annual Pro Plan"
                      : user.priceId === "price_1Q32F1RrqqSKPUNWkMQXCrVC" ||
                        user.priceId === "price_1Pb0w5RrqqSKPUNWGX1T2G3O"
                      ? "Monthly Pro Plan"
                      : user.priceId === "price_1QMOYXRrqqSKPUNWcFVWJIs4" ||
                        user.priceId === "price_1QN9NyRrqqSKPUNWWwB1zAXa"
                      ? "Annual Grow Plan"
                      : user.priceId === "price_1QLXONRrqqSKPUNW7s5FxANR" ||
                        user.priceId === "price_1QN9JoRrqqSKPUNWuTZBJWS1"
                      ? "Monthly Grow Plan"
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
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Usage Limits
            </h2>
            <p className="text-sm text-muted-foreground">
              Here you can view your current usage limits for posts and words.
            </p>
          </div>
          <div className="w-[30%] space-y-4">
            <div className="flex flex-col">
              <span className="text-xs text-foreground">{usageText}</span>
              <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-1.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
                  style={{
                    width: `${(currentUsage / usageLimit) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex space-x-4">
          <div className="w-1/3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Pricing
            </h2>
            <p className="text-sm text-muted-foreground">
              Check out our different plans and what we offer.
            </p>
          </div>
          <div className="flex w-2/3 items-center justify-start">
            <Link href={"/pricing"}>
              <Button variant={"outline"}>Pricing and Plans</Button>
            </Link>
          </div>
        </section>
        {hasSubscription && (
          <section className="flex space-x-4">
            <div className="w-1/3">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Subscription
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your current subscription plan.
              </p>
            </div>
            <div className="flex w-2/3 items-center justify-start">
              <Link
                href={
                  env.NEXT_PUBLIC_NODE_ENV === "development"
                    ? "https://billing.stripe.com/p/login/test_aEU00F2YO3cF11eeUU"
                    : "https://billing.stripe.com/p/login/4gw9EzeXq3oe4N2dQQ"
                }
              >
                <Button variant={"outline"}>Manage Subscription</Button>
              </Link>
            </div>
          </section>
        )}
        <section className="flex space-x-4">
          <div className="w-1/3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
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

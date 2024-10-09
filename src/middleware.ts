import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding",
  "/preferences",
  "/settings",
  "/create(.*)",
  "/schedule(.*)",
  "/subscribe",
  "/saved(.*)",
  "/pricing(.*)",
  "/draft(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);

export default clerkMiddleware((auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = auth();

  // For users visiting /onboarding, don't try to redirect
  if (userId && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!userId && isProtectedRoute(req))
    return redirectToSignIn({ returnBackUrl: "/sign-in" });

  // Catch users who do not have `onboardingComplete: true` in their publicMetadata
  // Redirect them to the /onboading route to complete onboarding
  if (userId && !sessionClaims?.metadata?.onboardingComplete) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  if (
    userId &&
    !sessionClaims?.metadata?.hasAccess &&
    !req.nextUrl.pathname.startsWith("/subscribe") &&
    !req.nextUrl.pathname.startsWith("/pricing") &&
    !req.nextUrl.pathname.startsWith("/settings")
  ) {
    const subscribeUrl = new URL("/subscribe", req.url);
    return NextResponse.redirect(subscribeUrl);
  }

  // If the user is logged in and the route is protected, let them view.
  if (userId && isProtectedRoute(req)) return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|api/webhook/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

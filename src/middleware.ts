import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req) {
  const token = req.nextauth.token;

  // Redirect unauthenticated users to signin page
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (!token.onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/ai/:path*", "/api/schedule/:path*"],
};

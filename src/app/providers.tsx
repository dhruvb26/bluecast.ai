"use client";
import posthog from "posthog-js";
import { env } from "@/env";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    capture_pageleave: true, // Enable pageleave capture
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

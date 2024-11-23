"use server";

import { db } from "@/server/db";

export async function getStats() {
  try {
    // Get all users
    const allUsers = await db.query.users.findMany();

    // Count users who completed onboarding
    const completedOnboarding = allUsers.filter((user) => {
      if (!user.onboardingData) return false;
      const data = user.onboardingData as any;
      return data.role && data.topics && data.heardFrom;
    });

    // Count users who haven't completed onboarding
    const notCompletedOnboarding = allUsers.filter((user) => {
      if (!user.onboardingData) return true;
      const data = user.onboardingData as any;
      return !data.role || !data.topics || !data.heardFrom;
    });

    // Get role breakdown
    const roleBreakdown: Record<string, number> = {};
    completedOnboarding.forEach((user) => {
      const role = (user.onboardingData as any).role;
      roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;
    });

    // Get heard from breakdown
    const heardFromBreakdown: Record<string, number> = {};
    completedOnboarding.forEach((user) => {
      const heardFrom = (user.onboardingData as any).heardFrom;
      heardFromBreakdown[heardFrom] = (heardFromBreakdown[heardFrom] || 0) + 1;
    });

    // Get role breakdown by heard from source
    const rolesByHeardFrom: Record<string, Record<string, number>> = {};
    completedOnboarding.forEach((user) => {
      const heardFrom = (user.onboardingData as any).heardFrom;
      const role = (user.onboardingData as any).role;

      if (!rolesByHeardFrom[heardFrom]) {
        rolesByHeardFrom[heardFrom] = {};
      }
      rolesByHeardFrom[heardFrom][role] =
        (rolesByHeardFrom[heardFrom][role] || 0) + 1;
    });

    return {
      success: true,
      data: {
        totalUsers: allUsers.length,
        completedOnboarding: completedOnboarding.length,
        notCompletedOnboarding: notCompletedOnboarding.length,
        roleBreakdown,
        heardFromBreakdown,
        rolesByHeardFrom,
      },
    };
  } catch (error) {
    console.error("Error fetching onboarding stats:", error);
    throw new Error("Failed to fetch onboarding stats");
  }
}

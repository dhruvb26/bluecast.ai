import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  if (
    userId !== "user_2o3UtX2zFFgJh8HGG3quxJrRtP3" &&
    userId !== "user_2mcClELioxVoLfySM9DdYDbiSwG" &&
    userId !== "user_2mqOdAXi5NS404SUJaSMFR2fMFN" &&
    userId !== "user_2ntPOAWO2Jia6pS6sJkCyRLb8tj"
  ) {
    redirect("/create/posts");
  }

  return <>{children}</>;
}

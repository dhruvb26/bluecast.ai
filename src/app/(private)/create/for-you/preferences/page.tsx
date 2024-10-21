"use client";

import { useState, useEffect } from "react";
import { ForYouForm } from "@/components/forms/for-you-form";
import { Button } from "@/components/ui/button";
import { getForYouAnswers } from "@/actions/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ForYouPreferencesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAnswers() {
      const answers = await getForYouAnswers();
      setIsLoading(false);
    }
    fetchAnswers();
  }, []);

  return (
    <main className="p-8">
      <Link
        href="/create/for-you"
        className="inline-flex mb-2 transition-all items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-4 w-4 stroke-2" />
        Back
      </Link>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Update Your Preferences
          </h1>
          <p className="text-sm text-muted-foreground">
            Modify your answers to refine your personalized content.
          </p>
        </div>
      </div>
      <ForYouForm />
    </main>
  );
}

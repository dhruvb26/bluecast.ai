"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showBackButton = pathname !== "/create/posts";

  return (
    <div className="px-8 py-8">
      {showBackButton && (
        <Link
          href="/create/posts"
          className="inline-flex transition-all  items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className=" h-4 w-4 stroke-2" />
          Back
        </Link>
      )}
      {children}
    </div>
  );
}

"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showBackButton = pathname !== "/create/posts";

  return (
    <div>
      {showBackButton && (
        <div className="px-7 pt-4">
          <Link
            href="/create/posts"
            className="inline-flex transition-all items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4 stroke-2" />
            Back
          </Link>
        </div>
      )}
      <div className="px-8 py-2">{children}</div>
    </div>
  );
}

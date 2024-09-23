"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignOut() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      await signOut({ redirect: false });
      router.push("/");
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/brand/icon.png"
            width={64}
            height={64}
            alt="Spireo Logo"
          />
        </div>
        <h1 className="mb-4 text-3xl font-bold">Signing you out...</h1>
        <p className="text-gray-600">
          Thank you for using Spireo. You'll be redirected shortly.
        </p>
      </div>
    </div>
  );
}

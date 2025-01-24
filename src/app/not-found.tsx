import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export const runtime = "edge";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center justify-center h-screen">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center flex flex-col items-center justify-center">
          <Image
            className="mb-4"
            src="/brand/Bluecast Logo.png"
            height={250}
            width={250}
            alt=""
          />
          <p className="mb-4 text-muted-foreground">
            Sorry, we can't find that page. You'll find lots to explore on the
            dashboard.
          </p>
          <Button
            variant={"link"}
            className="px-0 text-foreground hover:text-foreground hover:underline group"
          >
            <Link href={"/create/posts"}>Explore our templates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

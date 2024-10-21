"use client";
import { GridCards } from "@/components/dashboard/grid-cards";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookDashed, PenSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { saveDraft } from "@/actions/draft";

const GettingStartedSteps = async () => {
  const router = useRouter();
  const handleCreateDraft = async () => {
    const id = uuid();
    await saveDraft(id, "");
    router.push(`/draft/${id}`);
  };
  return (
    <main className="space-y-8 p-4 sm:p-8">
      <div>
        <div className="mb-8 text-left">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Explore Our Features and Resources
          </h1>
          <p className="text-sm text-muted-foreground">
            Discover how our tools and resources can help you enhance your
            LinkedIn presence and achieve your goals.
          </p>
        </div>
        <div className="mb-8 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
          <div className="relative w-full lg:w-[60%] pb-[56.25%] lg:pb-[33.15%]">
            <iframe
              src="https://www.youtube.com/embed/SVEZBg8FQtY"
              title="Quick Start Guide"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-md"
            ></iframe>
          </div>
          <div className="flex flex-col space-y-4 w-full lg:w-[40%]">
            <Card className="h-full w-full transition-all hover:-translate-y-1 hover:shadow-sm">
              <CardContent className="p-6 relative h-full">
                <Link
                  href={"https://www.bluecast.ai/"}
                  target="_blank"
                  className="block h-full"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex-shrink-0 flex items-center justify-center w-full">
                      <Image
                        src="/brand/Bluecast Symbol.png"
                        width={40}
                        height={40}
                        alt="AI-powered growth tools"
                        className="object-contain"
                      />
                    </div>
                    <h2 className="text-balance text-center text-lg font-semibold mb-2 tracking-tight">
                      AI-Powered LinkedIn Growth Tools
                    </h2>
                    <div className="flex flex-col items-start justify-between flex-grow">
                      <p className="text-center text-sm text-muted-foreground">
                        Bluecast offers cutting-edge AI features to supercharge
                        your LinkedIn presence. Our tools help you grow your
                        network effectively.
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
            <Card className="h-full w-full transition-all hover:-translate-y-1 hover:shadow-sm">
              <CardContent className="p-6 relative h-full">
                <Link
                  href={"https://bluecast.canny.io/feature-requests"}
                  target="_blank"
                  className="block h-full"
                >
                  <div className="flex flex-col h-full items-center justify-center">
                    <div className="mb-4 flex-shrink-0 flex items-center justify-center w-full">
                      <Image
                        src="/icons/feedback.png"
                        width={65}
                        height={65}
                        alt="AI-powered growth tools"
                        className="object-contain"
                      />
                    </div>
                    <h2 className="max-w-80 mb-2 text-lg text-center font-semibold tracking-tight">
                      We Value Your Feedback
                    </h2>
                    <p className="text-sm text-muted-foreground text-center">
                      Got Bugs? Issues? Feedback? We're all ears! Share your
                      thoughts to help us improve.
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex flex-col items-start justify-center mt-8">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
            <Card className="flex-1">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  Start from Scratch
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Begin with a blank canvas and let your creativity flow,
                  complete with real-time post preview.
                </p>

                <Button
                  onClick={handleCreateDraft}
                  className="bg-gradient-to-r to-brand-blue-secondary from-brand-blue-primary hover:from-blue-500 hover:to-blue-500 hover:via-blue-500 border border-blue-500 text-white transition-all duration-300"
                >
                  <PenSquare size={18} className="mr-2" />
                  Write My First Post
                </Button>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-semibold tracking-tight">
                  Use a Template
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Craft your Bluecast-powered post. Choose from our curated
                  templates.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/create/posts")}
                >
                  <BookDashed size={18} className="mr-2" />
                  Explore Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GettingStartedSteps;

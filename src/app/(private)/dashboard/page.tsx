import { GridCards } from "@/components/dashboard/grid-cards";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

const GettingStartedSteps = async () => {
  return (
    <main className="space-y-8 p-8">
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
        <div className="mb-8 flex flex-row space-x-6">
          <div className="relative w-[60%] pb-[33.75%]">
            <iframe
              src="https://www.youtube.com/embed/SVEZBg8FQtY"
              title="Quick Start Guide"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
          <div className="flex flex-col space-y-4 w-[40%]">
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
                        your LinkedIn presence. From content creation to
                        engagement analysis, our tools help you grow your
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
                      Have ideas for new features? We're all ears! Share your
                      thoughts and suggestions to help us improve and bring new
                      functionalities that matter to you.
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <GridCards />
      </div>
    </main>
  );
};

export default GettingStartedSteps;

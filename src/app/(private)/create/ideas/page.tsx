"use client";
import { IdeaForm } from "@/components/forms/idea-form";
import Link from "next/link";
import { HardDrive } from "@phosphor-icons/react";
import { ArrowUpRight, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { saveIdea } from "@/actions/idea";
import { v4 as uuid } from "uuid";
import { useIdeasStore } from "@/store/idea";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarLoader } from "react-spinners";

export default function IdeasPage() {
  const { ideas, isLoading } = useIdeasStore();
  const router = useRouter();

  const handleSaveIdea = async (idea: string) => {
    try {
      const content = idea;
      const id = uuid();
      const result = await saveIdea(id, content);
      if (result.success) {
        toast.success("Idea saved successfully.");
      }
    } catch (error) {
      toast.error("Failed to save idea.");
    }
  };

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Generate Ideas
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate fresh ideas for your next blog post, social media campaign,
          or marketing strategy. Our AI-powered idea generator will help you
          break through writer's block and get your creative juices flowing.
        </p>
      </div>
      <div className="flex items-center justify-between mb-8">
        <IdeaForm />
      </div>
      <div className="w-full">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <BarLoader color="#1d51d7" height={3} width={300} />
          </div>
        ) : ideas.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <HardDrive
              weight="light"
              className="mb-2 text-muted-foreground"
              size={42}
            />
            <span className="text-sm text-muted-foreground">
              Nothing to see here yet.{" "}
              <Link href="/saved/ideas">
                Saved ideas{" "}
                <span
                  onClick={() => router.push("/saved/posts")}
                  className="cursor-pointer inline text-primary group"
                >
                  here
                  <ArrowUpRight
                    size={16}
                    className="inline transition-transform group-hover:translate-y-[-2px] group-hover:translate-x-[2px]"
                  />
                </span>
              </Link>
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea, index) => (
              <Card
                key={index}
                className="group relative hover:shadow-sm hover:-translate-y-1"
              >
                <CardContent className="p-4">
                  <p className="mb-4 text-left text-sm font-medium">"{idea}"</p>
                  <div className="icon-container justify-end  space-x-2 flex ">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size={"sm"}
                            variant={"outline"}
                            onClick={() => handleSaveIdea(idea)}
                          >
                            <Save size={15} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Link
                              href={`/create/posts/scratch?idea=${encodeURIComponent(
                                idea
                              )}`}
                            >
                              <Edit size={15} />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Create</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { getIdeas, deleteIdea, Idea } from "@/actions/idea";
import { toast } from "sonner";
import Link from "next/link";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  ArrowsCounterClockwise,
  ArrowUpRight,
  Empty,
  PaperPlaneTilt,
  Plus,
  ShareFat,
  TrashSimple,
} from "@phosphor-icons/react";
import { Delete, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";

const SavedIdeasPage = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const result = await getIdeas();
      if (result.success) {
        setIdeas(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      const result = await deleteIdea(ideaId);
      if (result.success) {
        toast.success("Idea deleted successfully.");
        setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the idea.");
    }
  };

  return (
    <main className="p-8">
      <div className="mb-2 text-left">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Saved Ideas
        </h1>
        <p className="mx-auto text-sm text-muted-foreground">
          Manage your saved ideas here.
        </p>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="flex h-[30vw] items-center justify-center">
            <BarLoader color="#1d51d7" height={3} width={300} />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
            <div className="mb-2">
              <Empty className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              No saved ideas.
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Generate new ideas to get started.
            </p>
            <Button
              variant={"outline"}
              onClick={() => router.push("/create/ideas")}
            >
              <ArrowsCounterClockwise
                size={16}
                className="mr-1"
                weight="bold"
              />
              Generate Ideas
            </Button>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="flex max-w-3xl items-center justify-between rounded-md border border-input hover:shadow-sm p-4"
              >
                <div className="flex flex-col">
                  <p className="mb-2 text-sm text-foreground">{idea.content}</p>
                  <p className="text-sm text-muted-foreground">
                    Saved • {new Date(idea.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() =>
                            router.push(
                              `/create/posts/scratch?idea=${encodeURIComponent(
                                idea.content
                              )}`
                            )
                          }
                          variant={"outline"}
                          size={"sm"}
                          className="text-foreground"
                        >
                          <Edit size={15} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={"outline"}
                          size={"sm"}
                          onClick={() => handleDeleteIdea(idea.id)}
                        >
                          <Trash size={15} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};

export default SavedIdeasPage;

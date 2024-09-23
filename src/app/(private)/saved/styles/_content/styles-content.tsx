"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getContentStyle,
  deleteContentStyle,
  updateStyleExample,
  ContentStyle,
} from "@/actions/style";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CustomLoader from "@/components/global/custom-loader";
import {
  Trash,
  Save,
  PenSquare,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Plus } from "@phosphor-icons/react";
import { PostsDialog } from "@/components/global/posts-dialog";
import { parseContent } from "@/utils/editor-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StylesContent() {
  const router = useRouter();
  const { id } = useParams();
  const [style, setStyle] = useState<ContentStyle | null>(null);
  const [examples, setExamples] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newExample, setNewExample] = useState("");
  const [changedExamples, setChangedExamples] = useState<Set<number>>(
    new Set()
  );
  const [styleName, setStyleName] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    fetchStyle();
  }, [id]);
  useEffect(() => {
    if (examples.length <= 3 && currentSlide !== 0) {
      setCurrentSlide(0);
    }
  }, [examples.length, currentSlide]);

  const fetchStyle = async () => {
    setIsLoading(true);
    if (id) {
      const result = await getContentStyle(id as string);
      setIsLoading(false);

      if (result.success && result.data) {
        setStyle(result.data);
        setExamples(result.data.examples);
        setStyleName(result.data.name);
      } else {
        toast.error("Failed to fetch style details.");
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
    setChangedExamples(new Set(changedExamples).add(index));
  };

  const handleAddExample = async (content: string) => {
    if (!content.trim() || !style) return;

    const result = await updateStyleExample(style.id, -1, content, "add");

    if (result.success) {
      setExamples((prevExamples) => [...prevExamples, content]);
      toast.success("Example added successfully.");
    } else {
      toast.error("Failed to add example.");
    }
  };

  const handleDeleteExample = async (index: number) => {
    if (!style) return;

    const result = await updateStyleExample(style.id, index, "", "delete");

    if (result.success) {
      const newExamples = examples.filter((_, i) => i !== index);
      setExamples(newExamples);
      setChangedExamples(
        new Set([...Array.from(changedExamples)].filter((i) => i !== index))
      );
      toast.success("Example deleted successfully.");
    } else {
      toast.error("Failed to delete example.");
    }
  };

  const handleSaveExample = async (index: number) => {
    if (!style) return;

    const result = await updateStyleExample(
      style.id,
      index,
      examples[index],
      "edit"
    );

    if (result.success) {
      setChangedExamples((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      toast.success("Example updated successfully.");
    } else {
      toast.error("Failed to update example.");
    }
  };

  const handleDeleteStyle = async () => {
    if (!style) return;

    const result = await deleteContentStyle(style.id);

    if (result.success) {
      toast.success("Style deleted successfully.");
      router.push("/saved/styles");
    } else {
      toast.error("Failed to delete style.");
    }
  };

  if (isLoading) {
    return <CustomLoader size={32} />;
  }

  return (
    <main className="p-8">
      <div className="mb-8 text-left">
        <div className="flex flex-row space-x-2 items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {styleName}
          </h1>
          <div className="flex space-x-2">
            <PostsDialog onSelect={handleAddExample} />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDeleteStyle}
                    variant={"outline"}
                    size={"sm"}
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
        </div>
        <p className="mx-auto text-sm text-muted-foreground">
          Manage your writing style here. Add at least 10 examples to get the
          desired results.
        </p>
      </div>

      <div className="relative overflow-visible">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: Math.ceil(examples.length / 3) }, (_, i) => (
            <div
              key={i}
              className="w-full flex-shrink-0 grid grid-cols-3 gap-4 px-4"
            >
              {examples.slice(i * 3, i * 3 + 3).map((example, index) => (
                <div key={index} className="mb-4">
                  <div className="flex space-x-2 justify-end py-2">
                    {changedExamples.has(index) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleSaveExample(index)}
                              size="sm"
                            >
                              <Save size={15} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleDeleteExample(index)}
                            variant={"outline"}
                            size={"sm"}
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
                  <Textarea
                    value={example}
                    onChange={(e) => handleExampleChange(index, e.target.value)}
                    className="min-h-[500px] items-start transition-all"
                    rows={4}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        {examples.length > 3 && (
          <div className="flex justify-center mt-4">
            <Button
              className="rounded-full"
              size={"icon"}
              variant={"ghost"}
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              size={"icon"}
              className="rounded-full"
              variant={"ghost"}
              onClick={() =>
                setCurrentSlide(
                  Math.min(Math.ceil(examples.length / 3) - 1, currentSlide + 1)
                )
              }
              disabled={currentSlide === Math.ceil(examples.length / 3) - 1}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

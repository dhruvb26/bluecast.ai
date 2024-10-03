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
import { Trash, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { PostsDialog } from "@/components/global/posts-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarLoader } from "react-spinners";
import { Empty, PlusCircle } from "@phosphor-icons/react";
import { AlertDescription } from "@/components/ui/alert";

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
    return (
      <div className="flex items-center justify-center h-screen">
        <BarLoader color="#1d51d7" height={3} width={300} />
      </div>
    );
  }
  if (examples.length === 0) {
    return (
      <main className="p-8">
        <div className="mb-8 text-left">
          <div className="flex flex-row space-x-2 items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {styleName}
            </h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-9"
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
          <p className="mx-auto text-sm text-muted-foreground">
            Please add up to 10 examples to achieve the desired results.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
          <div className="mb-2">
            <Empty className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            No examples yet
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Add your first example to get started.
          </p>
          <PostsDialog onSelect={handleAddExample} />
        </div>
      </main>
    );
  }
  return (
    <main className="p-8">
      <div className=" text-left">
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
                    className="h-9"
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
          Please add up to 10 examples to achieve the desired results.
        </p>
      </div>
      <div className="mt-2 w-[70%] rounded-md text-purple-600  p-4 text-left text-sm border border-purple-300 bg-purple-100/70">
        <span>
          <span className="font-semibold">NOTE: </span>
          Curate high-quality post examples for optimal results. Remember, the
          quality of your examples directly impacts the generated posts. Don't
          hesitate to remove any examples that don't meet your standards or fit
          your desired style.
        </span>
      </div>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: Math.ceil(examples.length / 3) }, (_, i) => (
            <div
              key={i}
              className="w-full flex-shrink-0 grid grid-cols-3 gap-4 pb-2 pt-8 z-50"
            >
              {examples.slice(i * 3, i * 3 + 3).map((example, index) => (
                <div key={index} className="mb-4">
                  <div className="flex space-x-2 justify-end py-2">
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

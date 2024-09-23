"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePostStore } from "@/store/post";
import { Loader2 } from "lucide-react";
import {
  InstructionsField,
  WritingStyleField,
  PostFormatField,
} from "./form-fields";
import { useRouter } from "next/navigation";

export const scratchStoryFormSchema = z.object({
  postContent: z.string().min(20, {
    message: "Content must be at least 20 characters.",
  }),
  tone: z
    .string()

    .optional(),
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  contentStyle: z.string().optional(),
});

const tones = [
  { value: "professional", label: "Professional 💼" },
  { value: "informative", label: "Informative 📊" },
  { value: "engaging", label: "Engaging 🤝" },
  { value: "inspiring", label: "Inspiring 🌟" },
  { value: "thought-provoking", label: "Thought-provoking 💭" },
  { value: "authentic", label: "Authentic 🙌" },
  { value: "concise", label: "Concise 📝" },
  { value: "humorous", label: "Humorous 😄" },
];

interface ScratchStoryFormProps {
  initialPostContent?: string;
}

export function ScratchStoryForm({
  initialPostContent = "",
}: ScratchStoryFormProps) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const {
    handleSubmit: storeHandleSubmit,
    handleGenerateInstructions,
    isLoading,
    linkedInPostInstructions,
    isGeneratingInstructions,
  } = usePostStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof scratchStoryFormSchema>>({
    resolver: zodResolver(scratchStoryFormSchema),
    defaultValues: {
      postContent: initialPostContent,
      tone: "",
      instructions: "",
      formatTemplate: "",
      contentStyle: "",
    },
  });

  useEffect(() => {
    if (initialPostContent) {
      form.setValue("postContent", initialPostContent);
    }
  }, [initialPostContent, form]);

  useEffect(() => {
    form.setValue("formatTemplate", selectedFormat || "");
  }, [selectedFormat, form]);

  useEffect(() => {
    if (linkedInPostInstructions) {
      form.setValue("instructions", linkedInPostInstructions);
    }
  }, [linkedInPostInstructions, form]);

  const onSubmit = (data: z.infer<typeof scratchStoryFormSchema>) => {
    storeHandleSubmit("posts/scratch", data);
  };

  const generateInstructions = async (e: React.MouseEvent) => {
    e.preventDefault();
    const data = form.getValues();
    await handleGenerateInstructions(data);
  };

  const handleSelectFormat = (format: string) => {
    setSelectedFormat(format);
    form.setValue("formatTemplate", format);
  };

  const handleSelectStyle = (styleId: string) => {
    form.setValue("contentStyle", styleId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <PostFormatField
          form={form}
          selectedFormat={selectedFormat as string}
          setSelectedFormat={setSelectedFormat as any}
          handleSelectFormat={handleSelectFormat}
        />

        <WritingStyleField form={form} onSelectStyle={handleSelectStyle} />

        <FormField
          control={form.control}
          name="postContent"
          render={({ field }) => (
            <FormItem id="tour-4">
              <FormLabel>Post Topic</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the main topic and key points of your post."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed outline of your post's content. The more
                specific you are, the better the generated result will be.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem id="tour-5">
              <FormLabel>Post Tone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose the tone of your post" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select a tone to set the overall mood and voice of your post.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <InstructionsField
          form={form}
          isGeneratingInstructions={isGeneratingInstructions}
          generateInstructions={generateInstructions}
        />

        <Button id="tour-7" type="submit" loading={isLoading}>
          {isLoading ? "Generating" : "Generate"}
        </Button>
      </form>
    </Form>
  );
}

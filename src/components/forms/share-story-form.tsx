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
import {
  InstructionsField,
  WritingStyleField,
  PostFormatField,
} from "./form-fields";

export const shareStoryFormSchema = z.object({
  storyType: z.enum(["challenge", "success", "general"]),
  storyContent: z.string().min(20, {
    message: "Story content must be at least 20 characters.",
  }),
  outcome: z.string().min(10, {
    message: "Outcome must be at least 10 characters.",
  }),
  feeling: z.string().min(1, {
    message: "Please select a feeling.",
  }),
  lesson: z.string().min(10, {
    message: "Lesson or advice must be at least 10 characters.",
  }),
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  contentStyle: z.string().optional(),
});

const storyTypes = [
  { value: "challenge", label: "A challenge I overcame" },
  { value: "success", label: "A success I achieved" },
  { value: "general", label: "A general experience or insight" },
];

const feelings = [
  { value: "proud", label: "😊 Proud" },
  { value: "excited", label: "😃 Excited" },
  { value: "relieved", label: "😌 Relieved" },
  { value: "challenged", label: "🤔 Challenged" },
  { value: "frustrated", label: "😤 Frustrated" },
  { value: "grateful", label: "🙏 Grateful" },
];

export function ShareStoryForm() {
  const form = useForm<z.infer<typeof shareStoryFormSchema>>({
    resolver: zodResolver(shareStoryFormSchema),
    defaultValues: {
      storyType: "general",
      storyContent: "",
      outcome: "",
      feeling: "",
      lesson: "",
      instructions: "",
      formatTemplate: "",
    },
  });
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const {
    handleSubmit: storeHandleSubmit,
    handleGenerateInstructions,
    isLoading,
    linkedInPostInstructions,
    isGeneratingInstructions,
  } = usePostStore();

  useEffect(() => {
    form.setValue("formatTemplate", selectedFormat || "");
  }, [selectedFormat, form]);

  useEffect(() => {
    if (linkedInPostInstructions) {
      form.setValue("instructions", linkedInPostInstructions);
    }
  }, [linkedInPostInstructions, form]);

  const onSubmit = (data: z.infer<typeof shareStoryFormSchema>) => {
    storeHandleSubmit("posts/story", data);
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
          name="storyContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tell us your story</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your experience, challenge, or success."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="outcome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What was the outcome?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the result or how the situation concluded."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="feeling"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                How did this experience primarily make you feel?
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a feeling" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {feelings.map((feeling) => (
                    <SelectItem key={feeling.value} value={feeling.value}>
                      {feeling.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lesson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                What lesson or advice would you like to share?
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share the key takeaway or advice from this experience..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <InstructionsField
          form={form}
          isGeneratingInstructions={isGeneratingInstructions}
          generateInstructions={generateInstructions}
        />
        <Button type="submit" loading={isLoading}>
          {isLoading ? "Generating" : "Generate"}
        </Button>
      </form>
    </Form>
  );
}

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
import { usePostStore } from "@/store/post";
import {
  InstructionsField,
  WritingStyleField,
  PostFormatField,
} from "./form-fields";

export const learningFormSchema = z.object({
  learning: z.string().min(20, {
    message: "Learning content must be at least 20 characters.",
  }),
  how: z.string().min(10, {
    message: "How you learned must be at least 10 characters.",
  }),
  takeaways: z.string().min(10, {
    message: "Key takeaways must be at least 10 characters.",
  }),
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  contentStyle: z.string().optional(),
});

export function LearningForm() {
  const form = useForm<z.infer<typeof learningFormSchema>>({
    resolver: zodResolver(learningFormSchema),
    defaultValues: {
      learning: "",
      how: "",
      takeaways: "",
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

  const onSubmit = (data: z.infer<typeof learningFormSchema>) => {
    storeHandleSubmit("posts/learning", data);
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
          name="learning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What did you learn?</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe what you learned." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="how"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did you learn it?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe how you learned this."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="takeaways"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What were the key takeaways?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share the main insights or takeaways."
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

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
  PostFormatField,
  WritingStyleField,
  InstructionsField,
} from "./form-fields";

export const tipsFormSchema = z.object({
  tips: z.string().min(20, {
    message: "Tips content must be at least 20 characters.",
  }),
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  contentStyle: z.string().optional(),
});

export function TipsForm() {
  const form = useForm<z.infer<typeof tipsFormSchema>>({
    resolver: zodResolver(tipsFormSchema),
    defaultValues: {
      tips: "",
      instructions: "",
      formatTemplate: "",
      contentStyle: "",
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

  const onSubmit = (data: z.infer<typeof tipsFormSchema>) => {
    storeHandleSubmit("posts/tips", data);
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
          name="tips"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What are your valuable tips?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your tips or advice here."
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

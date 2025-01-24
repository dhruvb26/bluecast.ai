"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { usePostStore } from "@/store/post";
import {
  PostFormatField,
  WritingStyleField,
  InstructionsField,
} from "./form-fields";
import { Textarea } from "../ui/textarea";
import { useFunnelStore } from "@/store/funnel";
import { FunnelPromptSelector } from "../ideas/funnel-prompt-selector";

interface PromptTemplate {
  name: string;
  prompt: string;
  funnel_location: string;
  example: string;
}

export const FunnelTemplateFormSchema = z.object({
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  contentStyle: z.string().optional(),
  question: z.string(),
  answer: z.string(),
});

export function FunnelTemplateForm() {
  const form = useForm<z.infer<typeof FunnelTemplateFormSchema>>({
    resolver: zodResolver(FunnelTemplateFormSchema),
    defaultValues: {
      instructions: "",
      formatTemplate: "",
      contentStyle: "",
      question: "",
      answer: "",
    },
  });

  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const {
    handleSubmit: storeHandleSubmit,
    handleGenerateInstructions,
    isGeneratingInstructions,
    linkedInPostInstructions,
    isLoading,
  } = usePostStore();

  const funnelTemplate = useFunnelStore((state) => state.funnelTemplate);

  useEffect(() => {
    if (funnelTemplate) {
      form.setValue("question", funnelTemplate.prompt);
    }
  }, [funnelTemplate, form]);

  useEffect(() => {
    form.setValue("formatTemplate", selectedFormat || "");
  }, [selectedFormat, form]);

  useEffect(() => {
    if (linkedInPostInstructions) {
      form.setValue("instructions", linkedInPostInstructions);
    }
  }, [linkedInPostInstructions, form]);

  const handleSelectFormat = (format: string) => {
    setSelectedFormat(format);
    form.setValue("formatTemplate", format);
  };

  const handleSelectStyle = (styleId: string) => {
    form.setValue("contentStyle", styleId);
  };

  const generateInstructions = async (e: React.MouseEvent) => {
    e.preventDefault();
    const data = form.getValues();
    await handleGenerateInstructions(data);
  };

  const onSubmit = (data: z.infer<typeof FunnelTemplateFormSchema>) => {
    storeHandleSubmit("posts/funnel", data);
  };

  const handleSelectPrompt = (prompt: PromptTemplate) => {
    form.setValue("question", prompt.prompt);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 text-sm"
      >
        <PostFormatField
          form={form}
          selectedFormat={selectedFormat as string}
          setSelectedFormat={setSelectedFormat as any}
          handleSelectFormat={handleSelectFormat}
        />

        <WritingStyleField form={form} onSelectStyle={handleSelectStyle} />

        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Marketing Question</FormLabel>
                <div className="space-x-2 items-start flex flex-row">
                  <FunnelPromptSelector
                    onSelectPrompt={handleSelectPrompt}
                    triggerDialog={false}
                  />
                </div>
              </div>

              <FormControl>
                <Textarea
                  placeholder="Enter your question based on funnel stage"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your question should match your marketing funnel stage to
                generate targeted content.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide your answer matching the funnel stage"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Align your answer with the funnel stage for better content
                generation.
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

        <Button type="submit" loading={isLoading}>
          {isLoading ? "Generating" : "Generate"}
        </Button>
      </form>
    </Form>
  );
}

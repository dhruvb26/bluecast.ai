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

export const FunnelTemplateFormSchema = z.object({
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  contentStyle: z.string().optional(),
  postContent: z.string().optional(),
});

export function FunnelTemplateForm() {
  const form = useForm<z.infer<typeof FunnelTemplateFormSchema>>({
    resolver: zodResolver(FunnelTemplateFormSchema),
    defaultValues: {
      instructions: "",
      formatTemplate: "",
      contentStyle: "",
      postContent: "",
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
          name="postContent"
          render={({ field }) => (
            <FormItem>
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

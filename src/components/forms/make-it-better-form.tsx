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
import { PostsDialog } from "../global/posts-dialog";

export const makeItBetterFormSchema = z.object({
  postContent: z.string().min(20, {
    message: "Content must be at least 20 characters.",
  }),
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  contentStyle: z.string().optional(),
});

export function MakeItBetterForm() {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const {
    handleSubmit: storeHandleSubmit,
    handleGenerateInstructions,
    isLoading,
    linkedInPostInstructions,
    isGeneratingInstructions,
  } = usePostStore();

  const form = useForm<z.infer<typeof makeItBetterFormSchema>>({
    resolver: zodResolver(makeItBetterFormSchema),
    defaultValues: {
      postContent: "",
      instructions: "",
      formatTemplate: "",
      contentStyle: "",
    },
  });

  const handleSelectPost = async (content: string) => {
    form.setValue("postContent", content);
  };

  const handleOpenPostsDialog = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    form.setValue("formatTemplate", selectedFormat || "");
  }, [selectedFormat, form]);

  useEffect(() => {
    if (linkedInPostInstructions) {
      form.setValue("instructions", linkedInPostInstructions);
    }
  }, [linkedInPostInstructions, form]);

  const onSubmit = (data: z.infer<typeof makeItBetterFormSchema>) => {
    storeHandleSubmit("posts/better", data);
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
        <div className="flex flex-col space-y-2 w-full">
          <FormField
            control={form.control}
            name="postContent"
            render={({ field }) => (
              <FormItem id="tour-4">
                <FormLabel>Your Post</FormLabel>
                <FormControl>
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Enter your current post here."
                      {...field}
                      className="flex-grow h-[175px]"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Put in your current post or select an existing one, and we'll
                  make it better for you.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-start">
            <PostsDialog
              onOpenDialog={handleOpenPostsDialog}
              triggerText="Select Post"
              onSelect={handleSelectPost}
            />
          </div>
        </div>
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

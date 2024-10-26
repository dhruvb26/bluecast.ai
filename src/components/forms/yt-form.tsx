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

export const RepurposeFormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  engagementQuestion: z.string().optional(),
  CTA: z.string().optional(),
  contentStyle: z.string().optional(),
});

export function YouTubeForm() {
  const form = useForm<z.infer<typeof RepurposeFormSchema>>({
    resolver: zodResolver(RepurposeFormSchema),
    defaultValues: {
      url: "",
      instructions: "",
      formatTemplate: "",
      engagementQuestion: "",
      CTA: "",
      contentStyle: "",
    },
  });
  const generateInstructions = async (e: React.MouseEvent) => {
    e.preventDefault();
    const data = form.getValues();
    await handleGenerateInstructions(data);
  };
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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

  const handleFormatChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedFormat(e.target.value);
    form.setValue("formatTemplate", e.target.value);
  };

  const handleClearFormat = () => {
    setSelectedFormat(null);
    form.setValue("formatTemplate", "");
  };

  const handleToggleCollapsible = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const onSubmit = (data: z.infer<typeof RepurposeFormSchema>) => {
    storeHandleSubmit("repurpose/yt", data);
  };

  const handleSelectStyle = (styleId: string) => {
    form.setValue("contentStyle", styleId);
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
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="Enter a YouTube video URL"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Drop in the URL for the YouTube video you want to repurpose.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full max-w-full rounded-lg bg-blue-50"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between px-4 py-4">
              <h2 className="flex items-center text-sm font-medium text-black">
                <Lightning
                  weight="duotone"
                  className="mr-1 text-blue-500"
                  size={22}
                />
                Add more information
              </h2>

              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={handleToggleCollapsible}
              >
                <CaretDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
                <span className="sr-only">Toggle</span>
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-4 pb-4">
            <FormField
              control={form.control}
              name="engagementQuestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engagement question</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your question here"
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Ask a question to encourage discussion and comments on your
                    post.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="CTA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call to Action refinement</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Refine your CTA here"
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Refine the call to action to be more specific to your
                    audience's needs.
                  </FormDescription>
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible> */}
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

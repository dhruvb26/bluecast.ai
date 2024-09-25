"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { usePostStore } from "@/store/post";
import FileUploadButton from "@/components/global/file-upload-button";
import { useUploadStore } from "@/store/post";
import {
  PostFormatField,
  WritingStyleField,
  InstructionsField,
} from "./form-fields";

export const RepurposeFormSchema = z.object({
  url: z.string().url(),
  instructions: z.string().optional(),
  formatTemplate: z.string().optional(),
  engagementQuestion: z.string().optional(),
  CTA: z.string().optional(),
  contentStyle: z.string().optional(),
});

export function PDFForm() {
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
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const {
    handleSubmit: storeHandleSubmit,
    handleGenerateInstructions,
    isGeneratingInstructions,
    linkedInPostInstructions,
    isLoading,
  } = usePostStore();
  const { url: uploadedUrl } = useUploadStore();

  useEffect(() => {
    form.setValue("formatTemplate", selectedFormat || "");
  }, [selectedFormat, form]);

  useEffect(() => {
    if (linkedInPostInstructions) {
      form.setValue("instructions", linkedInPostInstructions);
    }
  }, [linkedInPostInstructions, form]);

  useEffect(() => {
    form.setValue("url", uploadedUrl);
  }, [uploadedUrl, form]);

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
    storeHandleSubmit("repurpose/pdf", data);
  };

  const handleSelectStyle = (styleId: string) => {
    form.setValue("contentStyle", styleId);
  };
  const generateInstructions = async (e: React.MouseEvent) => {
    e.preventDefault();
    const data = form.getValues();
    await handleGenerateInstructions(data);
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
        <div className="flex w-full items-center justify-start">
          <FileUploadButton />
        </div>

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

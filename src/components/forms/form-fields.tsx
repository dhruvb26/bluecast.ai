import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PostFormatSelector } from "@/components/global/post-formatter";
import { ContentStyleSelector } from "@/components/global/content-style-selector";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createInstruction } from "@/actions/instruction";
import SaveInstructionButton from "../buttons/save-instructions-button";
import { InstructionSelector } from "../global/instruction-selector";

interface InstructionsFieldProps {
  form: UseFormReturn<any>;
  isGeneratingInstructions: boolean;
  generateInstructions: (e: React.MouseEvent) => void;
}
export const InstructionsField: React.FC<InstructionsFieldProps> = ({
  form,
  isGeneratingInstructions,
  generateInstructions,
}) => {
  const [triggerDialog, setTriggerDialog] = useState(false);

  const handleSelectInstruction = (instruction: string) => {
    form.setValue("instructions", instruction);
  };

  return (
    <FormField
      control={form.control}
      name="instructions"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Instructions</FormLabel>
            <div className="space-x-2 items-start flex flex-row">
              <SaveInstructionButton form={form} />
              <InstructionSelector
                onSelectInstruction={handleSelectInstruction}
                triggerDialog={triggerDialog}
              />
            </div>
          </div>
          <FormControl>
            <Textarea
              className="h-[150px]"
              autoComplete="off"
              placeholder="Add any specific requirements, preferences, or guidelines for your post."
              {...field}
            />
          </FormControl>
          <FormDescription>
            Fine-tune your post with custom instructions. Need inspiration?{" "}
            <span
              onClick={generateInstructions}
              className={`cursor-pointer text-primary hover:text-primary/90 ${
                isGeneratingInstructions ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {isGeneratingInstructions ? (
                <>
                  Generating
                  <Loader2 className="ml-1 inline-block h-4 w-4 animate-spin" />
                </>
              ) : (
                "Get AI-generated instructions."
              )}
            </span>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface WritingStyleFieldProps {
  form: UseFormReturn<any>;
  onSelectStyle: (styleId: string) => void;
}

export const WritingStyleField: React.FC<
  WritingStyleFieldProps & { optional?: boolean }
> = ({ form, onSelectStyle, optional = false }) => {
  const router = useRouter();

  return (
    <FormField
      control={form.control}
      name="contentStyle"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {optional ? "Writing Style (Optional)" : "Writing Style"}
          </FormLabel>
          <FormControl>
            <ContentStyleSelector onSelectStyle={onSelectStyle} />
          </FormControl>
          <FormDescription>
            {optional
              ? "Optionally choose a writing style to emulate a creator or create your custom styles."
              : "Choose a writing style to emulate a creator or create your custom styles."}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface PostFormatFieldProps {
  form: UseFormReturn<any>;
  selectedFormat: string;
  setSelectedFormat: React.Dispatch<React.SetStateAction<string>>;
  handleSelectFormat: (format: string) => void;
}

export const PostFormatField: React.FC<PostFormatFieldProps> = ({
  form,
  selectedFormat,
  setSelectedFormat,
  handleSelectFormat,
}) => (
  <FormField
    control={form.control}
    name="formatTemplate"
    render={({ field }) => (
      <FormItem>
        <FormControl>
          <PostFormatSelector onSelectFormat={handleSelectFormat} />
        </FormControl>
        {selectedFormat && (
          <>
            <Textarea
              value={selectedFormat}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setSelectedFormat(e.target.value);
                form.setValue("formatTemplate", e.target.value);
              }}
              className="mt-2 min-h-[175px]"
              placeholder="Customize your selected format here..."
            />
            <Button variant={"outline"} onClick={() => setSelectedFormat("")}>
              Clear Format
            </Button>
          </>
        )}
        <FormDescription>
          Choose a template structure for your post or create a custom format.
        </FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
);

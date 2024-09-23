import React from "react";
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

interface InstructionsFieldProps {
  form: UseFormReturn<any>;
  isGeneratingInstructions: boolean;
  generateInstructions: (e: React.MouseEvent) => void;
}

export const InstructionsField: React.FC<InstructionsFieldProps> = ({
  form,
  isGeneratingInstructions,
  generateInstructions,
}) => (
  <FormField
    control={form.control}
    name="instructions"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Instructions</FormLabel>
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

interface WritingStyleFieldProps {
  form: UseFormReturn<any>;
  onSelectStyle: (styleId: string) => void;
}

export const WritingStyleField: React.FC<WritingStyleFieldProps> = ({
  form,
  onSelectStyle,
}) => {
  const router = useRouter();

  return (
    <FormField
      control={form.control}
      name="contentStyle"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Writing Style</FormLabel>
          <FormControl>
            <ContentStyleSelector onSelectStyle={onSelectStyle} />
          </FormControl>
          <FormDescription>
            Choose a writing style to emulate a creator or create your custom
            styles.
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

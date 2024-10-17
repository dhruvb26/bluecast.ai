"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { WritingStyleField } from "./form-fields";
import { saveForYouAnswers, getForYouAnswers } from "@/actions/user";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import BarLoader from "react-spinners/BarLoader";
import { Check, X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const ForYouFormSchema = z.object({
  aboutYourself: z.string().min(1, "Please tell us about yourself"),
  targetAudience: z.string().min(1, "Please specify your target audience"),
  personalTouch: z.string().min(1, "Please describe your personal touch"),
  contentStyle: z.string().optional(),
  topics: z.array(z.string()).min(1, {
    message: "Please add at least one topic.",
  }),
  formats: z.array(z.string()).min(1, {
    message: "Please add at least one format.",
  }),
});
const topicSuggestions = [
  "Technology",
  "Business",
  "Marketing",
  "Finance",
  "Leadership",
  "Entrepreneurship",
  "Personal Development",
  "Career Advice",
  "Industry News",
  "Innovation",
];

const formatSuggestions = [
  "Story",
  "Tips",
  "Hot Takes",
  "Listicles",
  "How-to Guides",
  "Comparison",
  "Interview",
];

export function ForYouForm() {
  const pathname = usePathname();

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [topicInput, setTopicInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string | undefined>(
    undefined
  );
  // Add new state for formats
  const [formatInput, setFormatInput] = useState("");
  const [filteredFormatSuggestions, setFilteredFormatSuggestions] = useState<
    string[]
  >([]);
  const [selectedFormatIndex, setSelectedFormatIndex] = useState(-1);
  const formatSuggestionsRef = useRef<HTMLUListElement>(null);

  const form = useForm<z.infer<typeof ForYouFormSchema>>({
    resolver: zodResolver(ForYouFormSchema),
    defaultValues: {
      aboutYourself: "",
      targetAudience: "",
      personalTouch: "",
      contentStyle: "",
      topics: [],
      formats: [],
    },
  });
  useEffect(() => {
    const fetchExistingAnswers = async () => {
      try {
        const answers = await getForYouAnswers();
        if (answers) {
          form.reset({
            ...answers,
            contentStyle: answers.contentStyle || undefined,
            topics: answers.topics || [],
            formats: answers.formats || [],
          });
          setSelectedStyleId(answers.contentStyle || undefined);
        }
      } catch (error) {
        console.error("Error fetching existing answers:", error);
        toast.error("Failed to load your existing answers.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingAnswers();
  }, [form]);

  useEffect(() => {
    if (formatInput) {
      const lowercaseInput = formatInput.toLowerCase().trim();
      const filtered = formatSuggestions.filter((format) =>
        format.toLowerCase().includes(lowercaseInput)
      );

      const exactMatch = formatSuggestions.find(
        (format) => format.toLowerCase() === lowercaseInput
      );

      if (
        !exactMatch &&
        !filtered.some((format) => format.toLowerCase() === lowercaseInput) &&
        lowercaseInput !== ""
      ) {
        filtered.unshift(formatInput.trim());
      }

      setFilteredFormatSuggestions(filtered);
      setSelectedFormatIndex(-1);
    } else {
      setFilteredFormatSuggestions([]);
    }
  }, [formatInput]);

  // Add functions for handling formats
  const addFormat = (format: string) => {
    const currentFormats = form.getValues("formats");
    if (!currentFormats.includes(format)) {
      form.setValue("formats", [...currentFormats, format]);
    }
    setFormatInput("");
  };

  const removeFormat = (formatToRemove: string) => {
    const currentFormats = form.getValues("formats");
    form.setValue(
      "formats",
      currentFormats.filter((format) => format !== formatToRemove)
    );
  };

  const handleFormatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        selectedFormatIndex >= 0 &&
        selectedFormatIndex < filteredFormatSuggestions.length
      ) {
        addFormat(filteredFormatSuggestions[selectedFormatIndex] || "");
      } else if (formatInput) {
        addFormat(formatInput);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedFormatIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredFormatSuggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedFormatIndex((prevIndex) => Math.max(prevIndex - 1, -1));
    }
  };
  useEffect(() => {
    if (formatSuggestionsRef.current && selectedFormatIndex >= 0) {
      const selectedElement = formatSuggestionsRef.current.children[
        selectedFormatIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedFormatIndex]);

  useEffect(() => {
    if (topicInput) {
      const lowercaseInput = topicInput.toLowerCase().trim();
      const filtered = topicSuggestions.filter((topic) =>
        topic.toLowerCase().includes(lowercaseInput)
      );

      const exactMatch = topicSuggestions.find(
        (topic) => topic.toLowerCase() === lowercaseInput
      );

      if (
        !exactMatch &&
        !filtered.some((topic) => topic.toLowerCase() === lowercaseInput) &&
        lowercaseInput !== ""
      ) {
        filtered.unshift(topicInput.trim());
      }

      setFilteredSuggestions(filtered);
      setSelectedSuggestionIndex(-1);
    } else {
      setFilteredSuggestions([]);
    }
  }, [topicInput]);

  const addTopic = (topic: string) => {
    const currentTopics = form.getValues("topics");
    if (!currentTopics.includes(topic)) {
      form.setValue("topics", [...currentTopics, topic]);
    }
    setTopicInput("");
  };

  const removeTopic = (topicToRemove: string) => {
    const currentTopics = form.getValues("topics");
    form.setValue(
      "topics",
      currentTopics.filter((topic) => topic !== topicToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        selectedSuggestionIndex >= 0 &&
        selectedSuggestionIndex < filteredSuggestions.length
      ) {
        addTopic(filteredSuggestions[selectedSuggestionIndex] || "");
      } else if (topicInput) {
        addTopic(topicInput);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredSuggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prevIndex) => Math.max(prevIndex - 1, -1));
    }
  };

  useEffect(() => {
    if (suggestionsRef.current && selectedSuggestionIndex >= 0) {
      const selectedElement = suggestionsRef.current.children[
        selectedSuggestionIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedSuggestionIndex]);

  const onSubmit = async (data: z.infer<typeof ForYouFormSchema>) => {
    setIsSubmitting(true);
    try {
      await saveForYouAnswers(
        data.aboutYourself,
        data.targetAudience,
        data.personalTouch,
        data.contentStyle,
        data.topics,
        data.formats
      );
      toast.success("Your preferences have been saved.");

      // Check if the current path is "/create/for-you" and reload if true
      if (pathname === "/create/for-you") {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving For You answers:", error);
      toast.error("Failed to save your preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSelectStyle = (styleId: string) => {
    form.setValue("contentStyle", styleId);
    setSelectedStyleId(styleId);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full items-center justify-center flex">
        <BarLoader color="#1d51d7" height={3} width={300} />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 text-sm w-full max-h-fit"
      >
        <FormField
          control={form.control}
          name="aboutYourself"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tell us about yourself</FormLabel>
              <FormControl>
                <Textarea
                  autoComplete="off"
                  placeholder="For example: I'm a marketing professional with 10 years of experience in digital marketing and content creation."
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                What are some topics you want to post about?
              </FormLabel>
              <FormControl>
                <div className="space-y-1">
                  <Input
                    placeholder="For example: 'Marketing', 'Business', 'Technology'"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {filteredSuggestions.length > 0 && (
                    <div className="relative">
                      <ul
                        ref={suggestionsRef}
                        className="absolute z-50 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover p-1 text-popover-foreground shadow-md"
                      >
                        {filteredSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none ${
                              index === selectedSuggestionIndex
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                            onClick={() => {
                              addTopic(suggestion);
                            }}
                          >
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              {field.value.includes(suggestion) && (
                                <Check className="h-4 w-4" />
                              )}
                            </span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap space-x-1">
                    {field.value.map((topic) => (
                      <span
                        key={topic}
                        className="flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => removeTopic(topic)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="formats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What content formats do you prefer?</FormLabel>
              <FormControl>
                <div className="space-y-1">
                  <Input
                    placeholder="For example: 'Interviews', 'Tips', 'Hot Takes'"
                    value={formatInput}
                    onChange={(e) => setFormatInput(e.target.value)}
                    onKeyDown={handleFormatKeyDown}
                  />
                  {filteredFormatSuggestions.length > 0 && (
                    <div className="relative">
                      <ul
                        ref={formatSuggestionsRef}
                        className="absolute z-50 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover p-1 text-popover-foreground shadow-md"
                      >
                        {filteredFormatSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none ${
                              index === selectedFormatIndex
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                            onClick={() => {
                              addFormat(suggestion);
                            }}
                          >
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              {field.value.includes(suggestion) && (
                                <Check className="h-4 w-4" />
                              )}
                            </span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.value.map((format) => (
                      <span
                        key={format}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {format}
                        <button
                          type="button"
                          onClick={() => removeFormat(format)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                How would you describe your target audience?
              </FormLabel>
              <FormControl>
                <Textarea
                  autoComplete="off"
                  placeholder="For example: I want to reach out to small business owners who are looking to grow their online presence."
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personalTouch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How would you describe your writing style?</FormLabel>
              <FormControl>
                <Textarea
                  autoComplete="off"
                  placeholder="For example: I write in a way that is easy to understand and follow. I use simple language and avoid jargon."
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <WritingStyleField
          optional={true}
          form={form}
          onSelectStyle={handleSelectStyle}
        />

        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "Saving" : "Save Answers"}
        </Button>
      </form>
    </Form>
  );
}

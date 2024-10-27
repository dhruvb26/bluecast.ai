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
import { Input } from "@/components/ui/input";
import { useIdeasStore } from "@/store/idea";

const formSchema = z.object({
  topic: z.string().min(2, {
    message: "Topic must be at least 2 characters.",
  }),
});

export function IdeaForm() {
  const generateIdeas = useIdeasStore((state) => state.generateIdeas);
  const isLoading = useIdeasStore((state) => state.isLoading);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await generateIdeas(values.topic);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full sm:flex-row flex-col sm:space-y-0 space-y-2 sm:items-center items-start sm:space-x-2 space-x-0"
      >
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Topic</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  autoComplete="off"
                  placeholder="SEO, B2B, Technology, ..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter a topic you want to generate post ideas for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={isLoading} className="w-fit sm:w-auto">
          {isLoading ? "Generating" : "Generate"}
        </Button>
      </form>
    </Form>
  );
}

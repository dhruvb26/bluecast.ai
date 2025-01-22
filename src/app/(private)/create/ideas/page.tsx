"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdeasContent } from "@/components/ideas/ideas-content";
import { FunnelPromptsSection } from "@/components/ideas/funnel-prompts-section";
export default function IdeasPage() {
  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Content Ideation
        </h1>
        <p className="text-sm text-muted-foreground">
          Create compelling content ideas or work through guided prompts to
          develop your marketing funnel. Choose between free-form idea
          generation or structured prompts to shape your content strategy.
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList>
          <TabsTrigger className="w-1/2" value="generate">
            Generate Ideas
          </TabsTrigger>
          <TabsTrigger className="w-1/2" value="answer-prompts">
            Answer Prompts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <IdeasContent />
        </TabsContent>
        <TabsContent value="answer-prompts">
          <div className="mt-4">
            <FunnelPromptsSection />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}

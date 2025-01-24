"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdeasContent } from "@/components/ideas/ideas-content";
import { FunnelPromptsSection } from "@/components/ideas/funnel-prompts-section";
import NewBadge from "@/components/global/new-badge";
import { Sparkle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
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

        {/* <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Generate Ideas
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate fresh ideas for your next blog post, social media campaign,
          or marketing strategy. Our AI-powered idea generator will help you
          break through writer's block and get your creative juices flowing.
        </p> */}
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList>
          <TabsTrigger className="w-1/2" value="generate">
            Generate Ideas
          </TabsTrigger>
          <TabsTrigger className="w-1/2 inline" value="answer-prompts">
            Answer Prompts
            <Badge className="mx-4 inline font-normal bg-purple-50 border hover:bg-purple-100 border-purple-100 text-purple-600">
              <Sparkle weight="duotone" className="inline mr-1" size={12} />
              New
            </Badge>
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

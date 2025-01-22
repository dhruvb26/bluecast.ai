"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { BarLoader } from "react-spinners";

interface PromptTemplate {
  name: string;
  prompt: string;
  funnel_location: string;
  example: string;
}

interface OrganizedData {
  TOFU: PromptTemplate[];
  MOFU: PromptTemplate[];
  BOFU: PromptTemplate[];
}

export function FunnelPromptSelector({
  onSelectPrompt,
  triggerDialog,
}: {
  onSelectPrompt: (prompt: PromptTemplate) => void;
  triggerDialog?: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(
    null
  );
  const [prompts, setPrompts] = useState<OrganizedData | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("TOFU");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (triggerDialog) {
      setIsDialogOpen(true);
    }
    fetchPrompts();
  }, [triggerDialog]);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/ideas/templates");
      const result = (await response.json()) as {
        success: boolean;
        data: OrganizedData;
      };

      if (result.success) {
        setPrompts(result.data);
      } else {
        toast.error("Failed to fetch prompts");
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast.error("Failed to fetch prompts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsDialogOpen(true)}>Select Question</Button>
      </DialogTrigger>

      <DialogContent className="min-h-[80vh] sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Funnel Stage Prompts
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-muted-foreground">
            Select a prompt template based on your marketing funnel stage.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} defaultValue="TOFU" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger
              className="w-1/3   "
              value="TOFU"
              onClick={() => setSelectedTab("TOFU")}
            >
              Top of Funnel
            </TabsTrigger>
            <TabsTrigger
              className="w-1/3"
              value="MOFU"
              onClick={() => setSelectedTab("MOFU")}
            >
              Middle of Funnel
            </TabsTrigger>
            <TabsTrigger
              className="w-1/3"
              value="BOFU"
              onClick={() => setSelectedTab("BOFU")}
            >
              Bottom of Funnel
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex h-[500px] items-center justify-center">
              <div className="text-sm text-muted-foreground">
                <BarLoader color="#2563EB" />
              </div>
            </div>
          ) : (
            prompts &&
            ["TOFU", "MOFU", "BOFU"].map((stage) => (
              <TabsContent key={stage} value={stage}>
                <ScrollArea className="h-[500px] w-full pr-4">
                  {prompts[stage as keyof OrganizedData].map(
                    (template, index) => (
                      <div
                        key={`${stage}-${index}`}
                        className={`mb-4 rounded-lg p-4 transition-all duration-200 ${
                          selectedPrompt?.prompt === template.prompt
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-white border border-input"
                        }`}
                        onClick={() => setSelectedPrompt(template)}
                      >
                        <div className="mb-2 text-sm text-blue-600 font-semibold">
                          {template.name.replace(/^\d+\.\s*/, "")}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {template.prompt}
                        </div>
                        {/* {template.example && (
                          <div className="text-xs text-gray-500 italic">
                            Example: {template.example}
                          </div>
                        )} */}
                      </div>
                    )
                  )}
                </ScrollArea>
              </TabsContent>
            ))
          )}
        </Tabs>

        <div className="flex justify-end space-x-2 py-0">
          <Button
            onClick={() => {
              if (selectedPrompt) {
                onSelectPrompt(selectedPrompt);
                setIsDialogOpen(false);
              } else {
                toast.error("Please select a prompt template");
              }
            }}
          >
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

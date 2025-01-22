import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarLoader } from "react-spinners";
import { HardDrive } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUpRight, Edit, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFunnelStore } from "@/store/funnel";

interface Template {
  name: string;
  prompt: string;
  funnel_location: string;
  example: string;
}

export function FunnelPromptsSection() {
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setFunnelTemplate = useFunnelStore((state) => state.setFunnelTemplate);

  const handleGenerate = async () => {
    if (!selectedStage) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/ideas/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: selectedStage }),
      });

      const data = (await response.json()) as {
        success: boolean;
        data: Template[];
      };
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (template: Template) => {
    try {
      // Implement your save logic here
      toast.success("Template saved successfully.");
    } catch (error) {
      toast.error("Failed to save template.");
    }
  };

  const handleCreatePost = (template: Template) => {
    setFunnelTemplate({
      name: template.name,
      prompt: template.prompt,
      funnel_location: template.funnel_location,
    });
    router.push(`/create/posts/funnel`);
  };

  return (
    <div>
      <div className="flex flex-col items-start justify-center space-y-2 py-1">
        <Label>Stage</Label>
        <div className="w-full flex flex-row items-center justify-start space-x-2">
          <Select onValueChange={setSelectedStage} value={selectedStage}>
            <SelectTrigger>
              <SelectValue placeholder="Select funnel stage" className="mt-1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOFU">TOFU (Top of Funnel)</SelectItem>
              <SelectItem value="MOFU">MOFU (Middle of Funnel)</SelectItem>
              <SelectItem value="BOFU">BOFU (Bottom of Funnel)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            loading={isLoading}
            onClick={handleGenerate}
            disabled={isLoading || !selectedStage}
          >
            Generate
          </Button>
        </div>
        <Label className="text-sm text-muted-foreground font-normal">
          Select your funnel stage
        </Label>
      </div>

      <div className="w-full mt-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <BarLoader color="#2563eb" height={3} width={300} />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <HardDrive
              weight="light"
              className="mb-2 text-muted-foreground"
              size={42}
            />
            <span className="text-sm text-muted-foreground">
              Select a stage and generate templates
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <Card
                key={index}
                className="group relative hover:shadow-sm hover:-translate-y-1"
              >
                <CardContent className="p-4 flex flex-col min-h-[200px]">
                  <div className="flex-grow">
                    <h3 className="font-medium mb-2">
                      {template.name.replace(/\d+\.\s*/, "")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 min-h-[100px]">
                      {template.prompt}
                    </p>
                  </div>

                  <div className="icon-container justify-end space-x-2 flex mt-auto pt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveTemplate(template)}
                          >
                            <Save size={15} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCreatePost(template)}
                          >
                            <Edit size={15} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Create</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

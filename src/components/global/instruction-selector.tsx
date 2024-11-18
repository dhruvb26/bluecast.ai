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
import {
  listInstructions,
  updateInstruction,
  deleteInstruction,
  type Instruction,
} from "@/actions/instruction";
import { toast } from "sonner";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { SaveIcon, TrashIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarLoader } from "react-spinners";
import { Empty } from "@phosphor-icons/react";

export function InstructionSelector({
  onSelectInstruction,
  triggerDialog,
}: {
  onSelectInstruction: (instruction: string) => void;
  triggerDialog?: boolean;
}) {
  const [selectedInstruction, setSelectedInstruction] =
    useState<Instruction | null>(null);
  const [editedInstructions, setEditedInstructions] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (triggerDialog) {
      setIsDialogOpen(true);
    }
    fetchInstructions();
  }, [triggerDialog]);

  const fetchInstructions = async () => {
    setIsLoading(true);
    try {
      const result = await listInstructions();
      if (result.success) {
        setInstructions(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to fetch instructions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstructionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditedInstructions(e.target.value);
    setHasChanges(e.target.value !== selectedInstruction?.instructions);
  };

  const handleSaveInstruction = async () => {
    if (selectedInstruction && editedInstructions) {
      try {
        const result = await updateInstruction(
          selectedInstruction.id,
          selectedInstruction.name,
          editedInstructions
        );
        if (result.success) {
          toast.success("Instruction updated successfully.");
          fetchInstructions();
          setHasChanges(false);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Failed to update instruction.");
      }
    } else {
      toast.error(
        "Please select an instruction and make changes before saving."
      );
    }
  };

  const handleDeleteInstruction = async () => {
    if (selectedInstruction) {
      try {
        const result = await deleteInstruction(selectedInstruction.id);
        if (result.success) {
          toast.success("Instruction deleted successfully.");
          setSelectedInstruction(null);
          setEditedInstructions("");
          fetchInstructions();
          setHasChanges(false);
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Failed to delete instruction.");
      }
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setIsDialogOpen(true)}
            id="instruction-selector-tooltip"
          >
            Select Instruction
          </Button>
        </DialogTrigger>

        <DialogContent className="min-h-[80vh] sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Your Instructions
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-muted-foreground">
              Select an instruction from the left, edit if needed, and use it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-[500px] w-full">
            <ScrollArea className="w-1/2 h-full pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center w-full mt-60">
                  <BarLoader color="#2563eb" height={3} width={300} />
                </div>
              ) : instructions.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full flex-col text-sm mt-48">
                  <Empty className="w-12 h-12 text-primary" />
                  <h1 className="text-lg font-semibold tracking-tight">
                    No saved instructions yet.
                  </h1>
                  <p className="text-muted-foreground">
                    Start writing with a custom instruction or generate some
                    using AI.
                  </p>
                </div>
              ) : (
                instructions.map((instruction) => (
                  <div
                    key={instruction.id}
                    className={`mb-4 rounded-lg p-4 transition-all duration-200 ${
                      selectedInstruction?.id === instruction.id
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-white border border-input"
                    }`}
                    onClick={() => {
                      setSelectedInstruction(instruction);
                      setEditedInstructions(instruction.instructions);
                      setHasChanges(false);
                    }}
                  >
                    <div className="mb-2 text-sm font-semibold">
                      {instruction.name}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Last updated:{" "}
                      {new Date(instruction.createdAt).toLocaleString()}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {instruction.instructions}
                    </p>
                  </div>
                ))
              )}
            </ScrollArea>
            <div className="w-1/2 pl-4">
              <Textarea
                disabled={!selectedInstruction || isLoading}
                className="h-full w-full rounded-lg border-brand-gray-200 text-sm"
                value={editedInstructions}
                onChange={handleInstructionChange}
                placeholder="Select an instruction on the left to edit."
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 py-2">
            {selectedInstruction && (
              <>
                <TooltipProvider>
                  {hasChanges && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size={"icon"}
                          onClick={handleSaveInstruction}
                        >
                          <SaveIcon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size={"icon"}
                        onClick={handleDeleteInstruction}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            <Button
              onClick={() => {
                if (selectedInstruction) {
                  onSelectInstruction(editedInstructions);
                  setIsDialogOpen(false);
                } else {
                  toast.error("Please select an instruction before using it.");
                }
              }}
            >
              Use Instruction
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

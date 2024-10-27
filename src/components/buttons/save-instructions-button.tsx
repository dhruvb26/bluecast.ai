import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createInstruction } from "@/actions/instruction";

interface SaveInstructionButtonProps {
  form: UseFormReturn<any>;
}

const SaveInstructionButton: React.FC<SaveInstructionButtonProps> = ({
  form,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [instructionName, setInstructionName] = useState("");

  const handleSaveInstruction = async () => {
    const instructionText = form.getValues("instructions");
    if (!instructionText.trim()) {
      toast.error("Instruction text cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      await createInstruction(instructionName, instructionText);
      toast.success("Instruction saved successfully.");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save instruction:", error);
      toast.error("Failed to save instruction. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    const instructionText = form.getValues("instructions");
    if (!instructionText.trim()) {
      toast.error("Please enter instruction text before saving.");
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button onClick={handleOpenDialog} size="icon" variant="outline">
        <Save size={16} />
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Save Instruction
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter a name for your instruction to save it for future use.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Enter instruction name"
            value={instructionName}
            onChange={(e) => setInstructionName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveInstruction} loading={isSaving}>
              {isSaving ? "Saving" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SaveInstructionButton;

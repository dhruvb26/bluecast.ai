"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { savePostFormat } from "@/actions/format";
import { toast } from "sonner";

export function AddFormatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [template, setTemplate] = useState("");

  const handleSubmit = async () => {
    if (!category || !template) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await savePostFormat(template, category, true);

    if (result.success) {
      toast.success("Format saved successfully");
      setIsOpen(false);
      setCategory("");
      setTemplate("");
    } else {
      toast.error(result.error || "Failed to save format");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Format</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Format</DialogTitle>
          <DialogDescription>
            Create a new public format template. Enter a category and your
            format template.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="category"
              placeholder="Enter category"
              className="col-span-4"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Textarea
              id="template"
              placeholder="Enter your format template"
              className="col-span-4"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Format</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

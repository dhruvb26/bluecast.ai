"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getPostFormat,
  updatePostFormatTemplate,
  addPostFormatTemplate,
  deletePostFormatTemplate,
  PostFormat,
} from "@/actions/format";
import { getDrafts, Draft } from "@/actions/draft";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CustomLoader from "@/components/global/custom-loader";
import { PlusIcon, TrashIcon, FileTextIcon, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseContent } from "@/utils/editor-utils";
import { Input } from "@/components/ui/input";
import { Plus } from "@phosphor-icons/react";

export default function FormatContent() {
  const { id } = useParams();
  const [format, setFormat] = useState<PostFormat | null>(null);
  const [templates, setTemplates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTemplate, setNewTemplate] = useState("");
  const [changedTemplates, setChangedTemplates] = useState<Set<number>>(
    new Set()
  );
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    fetchFormat();
    fetchDrafts();
  }, [id]);

  const fetchFormat = async () => {
    setIsLoading(true);
    const result = await getPostFormat(id as string);
    setIsLoading(false);

    if (result.success && result.data) {
      setFormat(result.data);
      setTemplates(result.data.templates);
    } else {
      toast.error("Failed to fetch format details.");
    }
  };

  const fetchDrafts = async () => {
    const result = await getDrafts();
    if (result.success && result.data) {
      setDrafts(result.data);
    } else {
      toast.error("Failed to fetch drafts.");
    }
  };

  const handleTemplateChange = (index: number, value: string) => {
    const newTemplates = [...templates];
    newTemplates[index] = value;
    setTemplates(newTemplates);
    setChangedTemplates(new Set(changedTemplates).add(index));
  };

  const handleSave = async (index: number) => {
    if (!format) return;

    const oldTemplate = format.templates[index];
    const newTemplate = templates[index];

    const result = await updatePostFormatTemplate(
      format.id,
      oldTemplate,
      newTemplate
    );

    if (result.success) {
      toast.success("Template updated successfully.");
      setFormat(result.data);
      setChangedTemplates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    } else {
      toast.error("Failed to update template.");
    }
  };

  const handleAddTemplate = async () => {
    if (!format || !newTemplate.trim()) return;

    const result = await addPostFormatTemplate(format.id, newTemplate);

    if (result.success) {
      toast.success("New template added successfully.");
      setFormat(result.data);
      setTemplates(result.data.templates);
      setNewTemplate("");
    } else {
      toast.error("Failed to add new template.");
    }
  };

  const handleDeleteTemplate = async (index: number) => {
    if (!format) return;

    const templateToDelete = templates[index];
    const result = await deletePostFormatTemplate(format.id, templateToDelete);

    if (result.success) {
      toast.success("Template deleted successfully.");
      setFormat(result.data);
      setTemplates(result.data.templates);
    } else {
      toast.error("Failed to delete template.");
    }
  };

  const handleAddDraftAsTemplate = async () => {
    if (!format || !selectedDraft || !selectedDraft.content) return;

    const parsedContent = parseContent(selectedDraft.content);
    const result = await addPostFormatTemplate(format.id, parsedContent);

    if (result.success) {
      toast.success("Draft added as template successfully.");
      setFormat(result.data);
      setTemplates(result.data.templates);
      setIsModalOpen(false);
      setSelectedDraft(null);
    } else {
      toast.error("Failed to add draft as template.");
    }
  };

  const handleAddCategory = async () => {
    // Implement the logic to add a new category
    console.log("Adding new category:", newCategoryName);
    // Reset the input field after adding
    setNewCategoryName("");
  };

  if (isLoading) {
    return <CustomLoader size={32} />;
  }

  if (!format) {
    return <div>Format not found.</div>;
  }
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 text-left">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {format.category}
        </h1>
        <p className="mx-auto text-sm text-muted-foreground">
          Manage your post formats here. Add 10 posts preferrably in a category
          to get desired results.
        </p>
      </div>
      {templates.map((template, index) => (
        <div key={index} className="mb-4">
          <Textarea
            value={template}
            onChange={(e) => handleTemplateChange(index, e.target.value)}
            className="mb-2"
            rows={4}
          />
          <div className="flex space-x-2 justify-end">
            {changedTemplates.has(index) && (
              <Button onClick={() => handleSave(index)}>Save Changes</Button>
            )}
            <Button
              onClick={() => handleDeleteTemplate(index)}
              variant="outline"
              size={"sm"}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <div className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight mb-2">
          Another Example Post
        </h2>
        <Textarea
          value={newTemplate}
          onChange={(e) => setNewTemplate(e.target.value)}
          className="mb-2"
          rows={4}
          placeholder="Enter new template here."
        />
        <div className="flex space-x-2">
          <Button onClick={handleAddTemplate} className="flex items-center">
            <Plus className="mr-1" weight="bold" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

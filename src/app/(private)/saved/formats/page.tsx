"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  getPostFormats,
  PostFormat,
  savePostFormat,
  deletePostFormat,
} from "@/actions/format";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import { Plus } from "@phosphor-icons/react";

export default function SavedFormatsPage() {
  const [userFormats, setUserFormats] = useState<PostFormat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchFormats();
  }, []);

  const fetchFormats = async () => {
    setIsLoading(true);
    const userResult = await getPostFormats(false);
    setIsLoading(false);

    if (userResult.success) {
      setUserFormats(userResult.data || []);
    } else {
      toast.error("Failed to fetch user formats.");
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/saved/formats/${categoryId}`);
  };

  const handleCreateNewFormat = async () => {
    if (!newCategory.trim() || !newTemplate.trim()) {
      toast.error("Please enter both category and template.");
      return;
    }

    const result = await savePostFormat("", newCategory, false);

    if (result.success) {
      toast.success("New format created successfully.");
      setNewCategory("");
      setNewTemplate("");
      setIsDialogOpen(false);
      fetchFormats();
    } else {
      toast.error("Failed to create new format.");
    }
  };

  const handleDeleteFormat = async (formatId: string) => {
    const result = await deletePostFormat(formatId);
    if (result.success) {
      toast.success("Format deleted successfully.");
      fetchFormats();
    } else {
      toast.error("Failed to delete format.");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 text-left">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Post Formats
        </h1>
        <p className="mx-auto text-sm text-muted-foreground">
          Manage your post formats here. Add 10 posts preferrably in a category
          to get desired results.
        </p>
      </div>

      {isLoading ? (
        <Loader2 size={32} className="animate-spin" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userFormats.map((format) => (
            <Card
              key={format.id}
              className="cursor-pointer transition-all hover:shadow-sm hover:-translate-y-1  relative"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight">
                  {format.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {format.templates.length} template(s)
                </p>
              </CardContent>

              <div
                className="absolute inset-0"
                onClick={() => handleCategoryClick(format.id)}
              ></div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFormat(format.id);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {userFormats.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground mt-8">
          You don't have any custom formats yet. Create one to get started!
        </p>
      )}

      <div className="mt-8 space-x-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              {" "}
              <Plus weight="bold" className="mr-1" />
              Create New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Textarea
                placeholder="Enter starting template"
                value={newTemplate}
                onChange={(e) => setNewTemplate(e.target.value)}
                rows={4}
              />
              <Button onClick={handleCreateNewFormat}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

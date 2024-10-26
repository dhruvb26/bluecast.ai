"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  getCreatorLists,
  deleteCreatorList,
  CreatorList,
  removeCreatorFromList,
} from "@/actions/list";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarLoader } from "react-spinners";
import { getUser } from "@/actions/user";
import { usePostStore } from "@/store/post";

const ListsContent = () => {
  const { id } = useParams();
  const router = useRouter();
  const [list, setList] = useState<CreatorList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setShowFeatureGate } = usePostStore();

  useEffect(() => {
    const fetchList = async () => {
      const response = await getCreatorLists(false);
      if (response.success && response.data) {
        const foundList = response.data.find((l) => l.id === id);
        setList(foundList || null);
      } else {
        toast.error("Failed to fetch list");
      }
    };
    fetchList();
  }, [id]);

  const handleDeleteCreator = async (creatorId: string) => {
    if (typeof id === "string") {
      const response = await removeCreatorFromList(id, creatorId);
      if (response.success) {
        toast.success("Creator removed from list successfully");
        // Refresh the list to reflect the changes
        const updatedListResponse = await getCreatorLists(false);
        if (updatedListResponse.success && updatedListResponse.data) {
          const updatedList = updatedListResponse.data.find((l) => l.id === id);
          setList(updatedList || null);
        }
      } else {
        toast.error(response.error || "Failed to remove creator from list");
      }
    } else {
      toast.error("Invalid list ID");
    }
  };

  const handleDeleteList = async () => {
    if (!list) return;
    const response = await deleteCreatorList(list.id);
    if (response.success) {
      toast.success("List deleted successfully");
      router.push("/saved/lists");
    } else {
      toast.error(response.error || "Failed to delete list");
    }
  };

  if (!list) {
    return (
      <div className="flex items-center justify-center h-screen">
        <BarLoader color="#2563eb" height={3} width={300} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const user = await getUser();

    if (!user.stripeSubscriptionId && !user.priceId) {
      setShowFeatureGate(true);
      setIsLoading(false);
      setIsDialogOpen(false); // Close the dialog
      return; // Cancel the request
    }

    try {
      const form = e.target as HTMLFormElement;
      const url = (form.elements.namedItem("creatorUrl") as HTMLInputElement)
        .value;

      const response = await fetch("/api/content/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          listName: list.name,
          isPublic: "false",
        }),
      });

      const data: any = await response.json();

      if (!data.success) {
        throw new Error(data.error || `Failed to add URL: ${url}`);
      }

      toast.success(`Creator added to list successfully.`);
      setIsDialogOpen(false);

      const updatedListResponse = await getCreatorLists(false);
      if (updatedListResponse.success && updatedListResponse.data) {
        const updatedList = updatedListResponse.data.find((l) => l.id === id);
        setList(updatedList || null);
      }
    } catch (error) {
      console.error("Error adding creator to list:", error);
      toast.error("Failed to add creator to list.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8">
      <div className="mb-8 text-left">
        <div className="flex flex-row space-x-2 items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {list.name}
          </h1>
          <div className="flex space-x-2">
            {list.items.length < 4 && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-8">
                    <Plus size={15} className="mr-1" />
                    Add Creator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Creator to List</DialogTitle>
                    <DialogDescription>
                      Enter the LinkedIn URL of the creator you want to add.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="creatorUrl">URL</Label>
                        <Input
                          id="creatorUrl"
                          placeholder="https://www.linkedin.com/in/johndoe/"
                          required
                        />
                      </div>
                      <Button
                        className="w-full"
                        type="submit"
                        loading={isLoading}
                      >
                        {isLoading ? "Copying" : "Copy"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDeleteList}
                    variant="outline"
                    size="sm"
                  >
                    <Trash size={15} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <p className="mx-auto text-sm text-muted-foreground">
          Manage your list of creators.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.items.map((item) => (
          <div
            key={item.id}
            className="border transition-all space-y-1 rounded-md border-input p-4"
          >
            <div className="flex items-start mt-2">
              <div className="mr-2 flex-shrink-0">
                <Image
                  src={item.creator.profileImageUrl || "/default-avatar.png"}
                  alt={item.creator.fullName || ""}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  {item.creator.fullName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.creator.headline || ""}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleDeleteCreator(item.creator.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ListsContent;

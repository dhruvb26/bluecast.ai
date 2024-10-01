"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod"; // Add this import
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getCreatorLists } from "@/actions/list";
import { CreatorList } from "@/actions/list";
import { Empty, Plus } from "@phosphor-icons/react";
import { UserPlus } from "lucide-react";
import { BarLoader } from "react-spinners";
import { getUser } from "@/actions/user";
import { usePostStore } from "@/store/post";
import dynamic from "next/dynamic";
const SubscriptionCard = dynamic(
  () => import("@/components/global/subscription-card"),
  {
    ssr: false,
  }
);
export default function CreateCreatorList() {
  const [urls, setUrls] = useState([""]);
  const [listName, setListName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [creatorLists, setCreatorLists] = useState<CreatorList[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useEffect(() => {
    fetchCreatorLists();
  }, []);
  const [isFetching, setIsFetching] = useState(true);
  const { showFeatureGate, setShowFeatureGate } = usePostStore();

  const linkedInUrlRegex = /^https:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
  const urlSchema = z
    .string()
    .regex(linkedInUrlRegex, { message: "Not a valid LinkedIn URL" });
  const formSchema = z.object({
    listName: z.string().nonempty(),
    urls: z.array(urlSchema).nonempty(),
    isPublic: z.boolean(),
  });

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
      const formData = {
        listName,
        urls: urls.filter((url) => url.trim() !== ""),
        isPublic,
      };

      const validatedData = formSchema.parse(formData);

      for (let i = 0; i < validatedData.urls.length; i++) {
        const url = validatedData.urls[i];
        const response = await fetch("/api/content/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            listName: validatedData.listName,
            isPublic: "false",
          }),
        });

        const data: any = await response.json();

        if (!data.success) {
          throw new Error(data.error || `Failed to add URL: ${url}`);
        }

        toast.success(`Creator ${i + 1} added to list successfully.`);
      }

      toast.success(
        `Creator list "${validatedData.listName}" created successfully with ${validatedData.urls.length} creators.`
      );
      // Reset form
      setUrls([""]);
      setListName("");
      setIsPublic(false);
      setIsDialogOpen(false);
      fetchCreatorLists();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        toast.error("Invalid form data. Please check your inputs.");
      } else {
        console.error("Error creating creator list:", error);
        toast.error("Failed to create creator list.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreatorLists = async () => {
    setIsFetching(true);
    try {
      const privateResult = await getCreatorLists(false);

      if (privateResult.success) {
        setCreatorLists(privateResult.data);
      }
    } catch (error) {
      console.error("Error fetching creator lists:", error);
      toast.error("An error occurred while fetching creator lists");
    } finally {
      setIsFetching(false);
      setIsDialogOpen(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <main className="p-8">
      {showFeatureGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <SubscriptionCard />
        </div>
      )}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Creator Lists
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your saved creator lists here.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {creatorLists.length > 0 && (
            <DialogTrigger asChild>
              <Button>
                <Plus weight="bold" className="inline mr-1" size={15} />
                Create
              </Button>
            </DialogTrigger>
          )}
          <DialogContent>
            <DialogHeader className="flex flex-row space-x-2">
              <div className="flex items-center justify-center border border-input rounded-lg p-3 h-fit mt-2 shadow-sm">
                <UserPlus className="inline" size={20} />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  New List
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Fill in the details below to create a custom creator list to
                  get inspiration.
                </DialogDescription>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="listName"> Name</Label>
                <Input
                  id="listName"
                  placeholder="Blockchain"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                {urls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <Label htmlFor={`url${index + 1}`}>URL {index + 1}</Label>
                      <Input
                        placeholder="https://www.linkedin.com/in/johndoe/"
                        id={`url${index + 1}`}
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...urls];
                          newUrls[index] = e.target.value;
                          setUrls(newUrls);
                        }}
                        required={index === 0}
                      />
                    </div>
                    {index === urls.length - 1 && urls.length < 4 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-6"
                        onClick={() => setUrls([...urls, ""])}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-row space-x-2 min-w-full items-center justify-center">
                <Button
                  className="w-full"
                  variant={"outline"}
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full"
                  type="submit"
                  onClick={handleSubmit}
                  loading={isLoading}
                >
                  {isLoading ? "Creating" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <BarLoader color="#1d51d7" height={3} width={300} />
        </div>
      ) : creatorLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
          <div className="mb-2">
            <Empty className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            No lists created yet.
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Create customized creator lists to keep up with.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} variant={"outline"}>
            <Plus weight="bold" className="inline mr-1" size={15} />
            Create
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creatorLists.map((list) => (
            <div
              key={list.id}
              className="border transition-all  space-y-1  rounded-md border-input p-4 "
            >
              <p className="text-xs text-muted-foreground">
                Updated • {list.updatedAt.toLocaleString()}
              </p>
              <h2 className="text-base font-semibold mb-2 tracking-tight">
                {list.name}
              </h2>
              <div className="flex flex-row justify-end items-center">
                <p className="text-xs text-muted-foreground">
                  {list.items.length} creator(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v4 as uuid } from "uuid";
import {
  getContentStyles,
  ContentStyle,
  saveContentStyle,
  deleteContentStyle,
} from "@/actions/style";
import { AlignJustify, ArrowUpRight, UserSearch } from "lucide-react";
import { toast } from "sonner";
import { getCreator, Creator } from "@/actions/creator";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LinkSimpleHorizontal, Plus } from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function SavedStylesPage() {
  const [creatorStyles, setCreatorStyles] = useState<ContentStyle[]>([]);
  const [customStyles, setCustomStyles] = useState<ContentStyle[]>([]);
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [creators, setCreators] = useState<{ [key: string]: Creator }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    const userResult = await getContentStyles(false);

    if (userResult.success) {
      const allStyles = userResult.data || [];
      setCreatorStyles(allStyles.filter((style) => style.creatorId !== null));
      setCustomStyles(allStyles.filter((style) => style.creatorId === null));
      fetchCreators(allStyles.filter((style) => style.creatorId !== null));
    } else {
      toast.error("Failed to fetch user styles.");
    }
  };

  const fetchCreators = async (styles: ContentStyle[]) => {
    const creatorIds = styles.map((style) => style.creatorId).filter(Boolean);
    const uniqueCreatorIds = Array.from(new Set(creatorIds));

    const creatorPromises = uniqueCreatorIds.map((id) => getCreator(id || ""));
    const creatorResults = await Promise.all(creatorPromises);

    const newCreators: { [key: string]: Creator } = {};
    creatorResults.forEach((result, index) => {
      if (result.success && result.data) {
        newCreators[uniqueCreatorIds[index] || ""] = result.data;
      }
    });

    setCreators((prevCreators) => ({ ...prevCreators, ...newCreators }));
  };

  const handleCopyCreatorStyle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/content/style", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: linkedInUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();
      if (data.success) {
        toast.success("Creator voice saved successfully.");
        fetchStyles();
      } else {
        toast.error(data.error || "Failed to copy creator style.");
      }
    } catch (error) {
      console.error("Error copying creator style:", error);
      toast.error("An error occurred while copying creator style.");
    } finally {
      setIsLoading(false);
      setLinkedInUrl("");
    }
  };

  const renderCreatorStyleList = (styles: ContentStyle[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {styles.map((style) => (
        <div
          key={style.id}
          className="border transition-all hover:shadow-sm space-y-1 hover:-translate-y-1 rounded-md border-input p-4 cursor-pointer"
          onClick={() => router.push(`/saved/styles/${style.id}`)}
        >
          <p className="text-xs text-muted-foreground">
            Updated • {style.updatedAt.toLocaleString()}
          </p>
          <div className="flex items-start mt-2">
            {style.creatorId && creators[style.creatorId] && (
              <div className="mr-2 flex-shrink-0">
                <Image
                  src={creators[style.creatorId]?.profileImageUrl || ""}
                  alt={creators[style.creatorId]?.fullName || ""}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
            )}

            <div>
              <h3 className="text-base font-semibold tracking-tight">
                <span
                  onClick={() =>
                    style.creatorId &&
                    creators[style.creatorId]?.profileUrl &&
                    window.open(creators[style.creatorId].profileUrl, "_blank")
                  }
                  className="p-0 h-auto cursor-pointer text-foreground flex items-center group"
                >
                  {style.creatorId && creators[style.creatorId]
                    ? creators[style.creatorId].fullName
                    : "Custom Style"}
                  {style.creatorId && creators[style.creatorId]?.profileUrl && (
                    <ArrowUpRight
                      size={20}
                      className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-[-2px] group-hover:translate-x-[2px]"
                    />
                  )}
                </span>
              </h3>
              {style.creatorId && creators[style.creatorId] && (
                <p className="text-sm text-muted-foreground">
                  {creators[style.creatorId].headline || ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-row justify-end items-center">
            <p className="text-xs text-muted-foreground">
              {style.examples.length} example(s)
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCustomStyleList = (styles: ContentStyle[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {styles.map((style) => (
        <div
          key={style.id}
          className="border transition-all hover:shadow-sm space-y-1 hover:-translate-y-1 rounded-md border-input p-4  cursor-pointer"
          onClick={() => router.push(`/saved/styles/${style.id}`)}
        >
          <p className="text-xs text-muted-foreground">
            Updated • {style.updatedAt.toLocaleString()}
          </p>
          <h2 className="text-base font-semibold tracking-tight">
            {style.name}
          </h2>
          <div className="flex flex-row justify-end items-center">
            <p className="text-xs text-muted-foreground">
              {style.examples.length} example(s)
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const [newStyleName, setNewStyleName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCustomStyle = async () => {
    if (!newStyleName.trim()) {
      toast.error("Style name is required.");
      return;
    }

    setIsCreating(true);
    try {
      const id = uuid();
      const result = await saveContentStyle(id, newStyleName, [], false);
      if (result.success) {
        toast.success("Custom style created successfully.");
        router.push(`/saved/styles/${id}`);
        fetchStyles();
        setNewStyleName("");
      } else {
        toast.error("Failed to create custom style.");
      }
    } catch (error) {
      console.error("Error creating custom style:", error);
      toast.error("An error occurred while creating custom style.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="p-8">
      <div className="mb-8 text-left">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Writing Styles
        </h1>
        <p className="mx-auto text-sm text-muted-foreground">
          Manage your styles here.
        </p>
      </div>
      <div className="mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <LinkSimpleHorizontal size={15} className="mr-1" />
              Creator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="flex flex-row space-x-2">
              <div className="flex items-center justify-center border border-input rounded-lg p-3 h-fit mt-2 shadow-sm">
                <UserSearch className="inline" size={20} />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  New Creator Style
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Fill in the URL below to emulate the creator's writing style.
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="flex flex-col space-y-2">
              <Label>URL</Label>
              <Input
                type="text"
                placeholder="https://www.linkedin.com/in/johndoe/"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
              />
              <Button onClick={handleCopyCreatorStyle} loading={isLoading}>
                {isLoading ? "Copying" : "Copy"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="ml-2" variant="outline">
              <Plus weight="bold" className="mr-1" />
              Custom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="flex flex-row space-x-2">
              <div className="flex items-center justify-center border border-input rounded-lg p-3 h-fit mt-2 shadow-sm">
                <AlignJustify className="inline" size={20} />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  New Custom Style
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Fill in the details below to create a new custom style.
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="flex flex-col space-y-4">
              <Label>Name</Label>
              <Input
                type="text"
                placeholder="Enter style name"
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
              />
              <Button onClick={handleCreateCustomStyle} loading={isCreating}>
                {isCreating ? "Creating" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="creator" className="w-full">
        <TabsList>
          <TabsTrigger value="creator">Creator Styles</TabsTrigger>
          <TabsTrigger value="custom">Custom Styles</TabsTrigger>
        </TabsList>
        <TabsContent value="creator">
          {renderCreatorStyleList(creatorStyles)}
        </TabsContent>
        <TabsContent value="custom">
          {renderCustomStyleList(customStyles)}
        </TabsContent>
      </Tabs>
    </main>
  );
}

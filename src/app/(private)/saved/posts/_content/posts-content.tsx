"use client";
import React, { useState, useEffect } from "react";
import { getDrafts, deleteDraft, Draft } from "@/actions/draft";
import { toast } from "sonner";
import { ParallaxScroll } from "@/components/ui/parallax-scroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CustomLoader from "@/components/global/custom-loader";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PenIcon, CalendarIcon, RocketIcon } from "lucide-react";
import { BarLoader } from "react-spinners";

type TabType = "saved" | "scheduled" | "published";

const SavedDraftsContent = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabType) || "saved";
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts(activeTab);
  }, [activeTab]);

  const fetchDrafts = async (status: TabType) => {
    setIsLoading(true);
    try {
      const result = await getDrafts(status);
      if (result.success) {
        const deserializedDrafts = result.data?.map((draft) => ({
          ...draft,
          content: JSON.parse(draft.content || ""),
        }));
        setDrafts(deserializedDrafts || []);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      console.error(err.message);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!draftToDelete) return;
    try {
      const result = await deleteDraft(draftToDelete);
      if (result.success) {
        toast.success("Draft deleted successfully.");
        setDrafts((prevDrafts) =>
          prevDrafts.filter((draft) => draft.id !== draftToDelete)
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the draft.");
    } finally {
      setDraftToDelete(null);
    }
  };

  const handleTabChange = (value: string) => {
    router.push(`/saved/posts?tab=${value}`);
  };
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[400px]">
          <BarLoader color="#1d51d7" height={3} width={300} />
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500">{error}</p>;
    }

    if (drafts.length === 0) {
      return <EmptyState type={activeTab} />;
    }

    return (
      <ParallaxScroll
        posts={drafts.map((draft) => ({
          id: draft.id,
          content: draft.content || {},
          status: draft.status,
          updatedAt: new Date(draft.updatedAt),
        }))}
        onDeleteDraft={(draftId: string) => setDraftToDelete(draftId)}
      />
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold tracking-tight mb-1">Drafts</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Manage your content creation journey here.
      </p>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>{renderContent()}</TabsContent>
      </Tabs>

      {/* {!isLoading && drafts.length > 0 && <CTACard />} */}

      <AlertDialog
        open={!!draftToDelete}
        onOpenChange={() => setDraftToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDraft}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function EmptyState({ type }: { type: TabType }) {
  const content = {
    saved: {
      icon: <PenIcon className="w-12 h-12 mb-4 text-primary" />,
      title: "No saved drafts yet",
      description:
        "Start your writing journey. Save your ideas and come back to them later.",
      action: "Create Draft",
    },
    scheduled: {
      icon: <CalendarIcon className="w-12 h-12 mb-4 text-primary" />,
      title: "No scheduled posts",
      description:
        "Plan ahead. Schedule your posts for consistent content delivery.",
      action: "Schedule Post",
    },
    published: {
      icon: <RocketIcon className="w-12 h-12 mb-4 text-primary" />,
      title: "No published posts",
      description:
        "Share your voice with the world. Publish your first post today.",
      action: "Publish Post",
    },
  };

  const { icon, title, description, action } = content[type];

  return (
    <Card className="text-center p-8 border-none">
      <CardContent className="flex flex-col items-center">
        {icon}
        <CardTitle className="text-lg text-semibold tracking-tight mb-1">
          {title}
        </CardTitle>
        <CardDescription className="mb-6">{description}</CardDescription>
        <Button
          onClick={() => {
            if (type === "saved") {
              window.location.href = "/create/posts";
            }
          }}
        >
          {action}
        </Button>
      </CardContent>
    </Card>
  );
}

export default SavedDraftsContent;

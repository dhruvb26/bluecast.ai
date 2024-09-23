"use client";

import React, { useState, useEffect } from "react";
import PostCard from "@/components/inspiration/post-card";
import { getCreatorLists } from "@/actions/list";
import { getPostsByCreatorId } from "@/actions/post";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { shuffle } from "@/utils/shuffle";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus } from "@phosphor-icons/react";
import { CreatorList } from "@/actions/list";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [lists, setLists] = useState<CreatorList[]>([]);
  const [posts, setPosts] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const publicListsResult = await getCreatorLists(true);
        const privateListsResult = await getCreatorLists(false);
        if (publicListsResult.success && privateListsResult.success) {
          const allLists = [
            ...publicListsResult.data,
            ...privateListsResult.data,
          ];
          setLists(allLists);
          setActiveTab(allLists[0]?.id || "");

          const postsData: { [key: string]: any[] } = {};
          for (const list of allLists) {
            const creatorIds = list.items.map(
              (item: { creatorId: string }) => item.creatorId
            );
            const listPosts = await Promise.all(
              creatorIds.map(async (id: string) => {
                const result = await getPostsByCreatorId(id);
                return result.success ? result.posts : [];
              })
            );
            postsData[list.id] = shuffle(listPosts.flat());
          }
          setPosts(postsData);
        } else {
          console.error(
            "Failed to fetch lists:",
            publicListsResult,
            privateListsResult
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="p-6 overflow-y-hidden">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Inspiration
          </h1>
          <p className="text-sm text-muted-foreground">
            Here are some of the most recent posts from the top creators on
            LinkedIn. Check back daily for new content!
          </p>
        </div>
        <Button onClick={() => router.push("/saved/lists")}>
          <Plus className="inline mr-1" weight="bold" />
          Custom List
        </Button>
      </div>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid grid-cols-7 w-full">
            {lists.map((list) => (
              <TabsTrigger key={list.id} value={list.id}>
                {list.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {lists.map((list) => (
            <TabsContent key={list.id} value={list.id}>
              <div className="overflow-auto max-h-[calc(100vh-200px)]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {posts[list.id]?.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </main>
  );
}

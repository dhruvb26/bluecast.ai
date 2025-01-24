"use client";

import React, { useState, useEffect } from "react";
import PostCard from "@/components/inspiration/post-card";
import { getCreatorLists } from "@/actions/list";
import { getPostsByCreatorId } from "@/actions/post";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreatorList } from "@/actions/list";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { BarLoader } from "react-spinners";
import { parseRelativeTime } from "@/utils/date";

export default function Home() {
  const router = useRouter();
  const [lists, setLists] = useState<CreatorList[]>([]);
  const [posts, setPosts] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({});
  const postsPerPage = 16;
  const [hasMore, setHasMore] = useState<{ [key: string]: boolean }>({});
  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Define the order of public lists
  const publicListOrder = [
    "Marketing",
    "Sales",
    "Startups",
    "Personal Brand",
    "AI",
    "Leadership",
    "Storytelling",
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const publicListsResult = await getCreatorLists(true);
        const privateListsResult = await getCreatorLists(false);
        if (publicListsResult.success && privateListsResult.success) {
          // Sort public lists according to defined order
          const sortedPublicLists = [...publicListsResult.data].sort((a, b) => {
            const indexA = publicListOrder.indexOf(a.name);
            const indexB = publicListOrder.indexOf(b.name);
            if (indexA === -1 && indexB === -1)
              return a.name.localeCompare(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });

          // Sort private lists alphabetically
          const sortedPrivateLists = [...privateListsResult.data].sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          const allLists = [...sortedPublicLists, ...sortedPrivateLists];
          setLists(allLists);
          setActiveTab(allLists[0]?.id || null);

          const postsData: { [key: string]: any[] } = {};
          const pageData: { [key: string]: number } = {};
          const hasMoreData: { [key: string]: boolean } = {};
          for (const list of allLists) {
            postsData[list.id] = [];
            pageData[list.id] = 1;
            hasMoreData[list.id] = true;
          }
          setPosts(postsData);
          setCurrentPage(pageData);
          setHasMore(hasMoreData);

          if (allLists[0]) {
            await fetchPosts(allLists[0].id);
          }
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

  useEffect(() => {
    if (activeTab && lists.length > 0) {
      if (posts[activeTab].length === 0) {
        fetchPosts(activeTab);
      } else if (inView && hasMore[activeTab]) {
        fetchPosts(activeTab);
      }
    }
  }, [activeTab, inView, hasMore]);

  const fetchPosts = async (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const creatorIds = list.items.map(
      (item: { creatorId: string }) => item.creatorId
    );
    const newPosts = await Promise.all(
      creatorIds.map(async (id: string) => {
        const result = await getPostsByCreatorId(
          id,
          postsPerPage,
          currentPage[listId]
        );
        return result.success ? result.posts : [];
      })
    );

    // Flatten and filter out undefined posts
    const allPosts: any[] = newPosts.flat();

    // Group posts by time period (month, week, day, hour)
    const groupedPosts: { [key: string]: any[] } = {};

    allPosts.forEach((post) => {
      const time = parseRelativeTime(post.time || "");
      const key = time.toISOString().split("T")[0]; // Use date as key
      if (!groupedPosts[key]) {
        groupedPosts[key] = [];
      }
      groupedPosts[key].push(post);
    });

    // Shuffle posts within each time period
    Object.keys(groupedPosts).forEach((key) => {
      for (let i = groupedPosts[key].length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [groupedPosts[key][i], groupedPosts[key][j]] = [
          groupedPosts[key][j],
          groupedPosts[key][i],
        ];
      }
    });

    // Combine all posts maintaining chronological order between groups
    const sortedPosts = Object.keys(groupedPosts)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .flatMap((key) => groupedPosts[key]);

    setPosts((prev) => ({
      ...prev,
      [listId]: [...prev[listId], ...sortedPosts],
    }));
    setCurrentPage((prev) => ({
      ...prev,
      [listId]: prev[listId] + 1,
    }));
    setHasMore((prev) => ({
      ...prev,
      [listId]: allPosts.length === postsPerPage * creatorIds.length,
    }));
  };

  return (
    <main className="p-8 overflow-y-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg  font-semibold tracking-tight text-foreground">
            Inspiration
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-prose">
            Here are some of the most recent posts from the top creators on
            LinkedIn. Create your own list of creators to keep up with.
          </p>
        </div>
        <Button
          onClick={() => router.push("/saved/lists")}
          className="whitespace-nowrap"
        >
          <Plus className="inline mr-1" size={16} />
          Create a Custom List
        </Button>
      </div>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <BarLoader color="#2563eb" height={3} width={300} />
        </div>
      ) : (
        <Tabs value={activeTab || ""} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid grid-cols-4 sm:grid-cols-7 w-full">
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
                {hasMore[list.id] && (
                  <div ref={ref} className="mt-4 flex justify-center">
                    <BarLoader color="#2563eb" height={3} width={300} />
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </main>
  );
}

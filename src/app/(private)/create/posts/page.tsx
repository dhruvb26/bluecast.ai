"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { usePostStore } from "@/store/post";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkle } from "@phosphor-icons/react";
import Refresh2 from "@/components/icons/refresh-2";
import PenWriting from "@/components/icons/pen-writing";
import Book from "@/components/icons/book";
import CircleInfo from "@/components/icons/circle-info";
import Keyboard from "@/components/icons/keyboard";
import { Funnel } from "@phosphor-icons/react";
import NewBadge from "@/components/global/new-badge";

const PostsPage = () => {
  const resetPostFields = usePostStore((state) => state.resetPostData);

  useEffect(() => {
    resetPostFields();
  }, [resetPostFields]);

  return (
    <main>
      <div className="mb-8 text-left">
        <h1 className="text-lg tracking-tight font-semibold text-foreground">
          Craft Engaging Posts with AI Assistance
        </h1>
        <p className="text-sm text-muted-foreground">
          Select from our range of AI-powered templates to kickstart your post
          creation process. Whether you're repurposing content or starting from
          scratch, we've got you covered.
        </p>
      </div>

      <div className="mb-8">
        <>
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Repurpose Content
          </h2>
        </>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link href="/create/posts/yt">
            <Card className="group h-fit overflow-hidden border-red-100 bg-red-50 transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex flex-col  p-4 text-foreground relative  space-y-2">
                <CardTitle className="text-base font-semibold tracking-tight flex justify-center items-center space-x-2">
                  YouTube{" "}
                  <ArrowRight
                    size={12}
                    className="inline text-foreground mx-2"
                  />{" "}
                  LinkedIn
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground text-center">
                  Transform YouTube content into LinkedIn gold. Just drop in the
                  URL and let AI do the rest.
                </p>
                <div className="w-full flex justify-center">
                  <Image
                    src="/icons/youtube.png"
                    width={45}
                    height={45}
                    alt=""
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/create/posts/transcribe">
            <Card className="group h-fit overflow-hidden border-blue-100 bg-blue-50 transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex flex-col p-4 text-foreground space-y-2">
                <CardTitle className="text-base font-semibold tracking-tight flex justify-center items-center space-x-2">
                  Audio{" "}
                  <ArrowRight
                    size={12}
                    className="inline text-foreground mx-2"
                  />{" "}
                  LinkedIn
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground text-center">
                  Upload an audio file and watch as our platform transforms it
                  into engaging LinkedIn posts.
                </p>
                <div className="w-full flex justify-center">
                  <Image src="/icons/audio.png" width={45} height={45} alt="" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/create/posts/blog">
            <Card className="group h-fit overflow-hidden border-orange-100 bg-orange-50 transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex flex-col  p-4 space-y-2 text-foreground relative ">
                <CardTitle className="text-base font-semibold tracking-tight flex justify-center items-center space-x-2">
                  Blog{" "}
                  <ArrowRight
                    size={12}
                    className="inline text-foreground mx-2"
                  />{" "}
                  LinkedIn
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground text-center">
                  Convert insightful blog posts into engaging LinkedIn content.
                  Simply input the URL and let our AI do the rest.
                </p>
                <div className="w-full flex justify-center">
                  <Image src="/icons/blogs.png" width={45} height={45} alt="" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/create/posts/pdf">
            <Card className="group h-fit overflow-hidden border-purple-100 bg-purple-50 transition-all  hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex flex-col p-4 text-foreground space-y-2">
                <CardTitle className="text-base font-semibold tracking-tight flex justify-center items-center space-x-">
                  PDF{" "}
                  <ArrowRight
                    size={12}
                    className="inline text-foreground mx-2"
                  />{" "}
                  LinkedIn
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground text-center">
                  Our platform enables you to transform PDF documents into
                  engaging LinkedIn posts effortlessly.
                </p>
                <div className="w-full flex justify-center">
                  <Image src="/icons/pdf.png" width={45} height={45} alt="" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div>
        <>
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Templates
          </h2>
        </>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link href={"/create/posts/funnel"}>
            <Card className="group bg-gray-25 h-full overflow-hidden border-input transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex h-[calc(100%-80px)] flex-col p-4 text-foreground relative ">
                <CardTitle className="text-base font-semibold tracking-tight">
                  <Funnel className="inline mr-2 text-foreground" />
                  Build Your Content Funnel
                  <NewBadge />
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground">
                  Create targeted content for each stage of your marketing
                  funnel to effectively guide and convert your audience.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={"/create/posts/refresh"} id="tour-2">
            <Card className="group bg-gray-25 h-full overflow-hidden border-input transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex h-[calc(100%-80px)] flex-col p-4 text-foreground relative ">
                <CardTitle className="text-base font-semibold tracking-tight items-end">
                  <Refresh2 className="inline mr-2 text-foreground" />
                  Refresh Writing Style{" "}
                  {/* <Badge className="bg-indigo-50 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-500 font-normal ml-1">
                    <Sparkle
                      weight="duotone"
                      className="inline mr-1"
                      size={16}
                    />
                    New
                  </Badge> */}
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground">
                  Use our AI-powered tool to adapt any post to a new writing
                  style, instantly.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={"/create/posts/scratch"} id="tour-2">
            <Card className="group bg-gray-25 h-full overflow-hidden border-input transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex h-[calc(100%-80px)] flex-col p-4 text-foreground relative ">
                <CardTitle className="text-base font-semibold tracking-tight items-end">
                  <PenWriting className="inline mr-2 text-foreground" />
                  Write from Scratch
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground">
                  Begin with a fresh slate and let AI enhance your writing for a
                  truly standout post.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={"/create/posts/story"}>
            <Card className="group bg-gray-25 h-full overflow-hidden border-input transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex h-[calc(100%-80px)] flex-col p-4 text-foreground relative ">
                <CardTitle className="text-base font-semibold tracking-tight">
                  <Keyboard className="inline mr-2 text-foreground" />
                  Share a Story
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground">
                  Turn your experiences, triumphs, or milestones into
                  captivating narratives.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={"/create/posts/learning"}>
            <Card className="group bg-gray-25 h-full overflow-hidden border-input transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex h-[calc(100%-80px)] flex-col p-4 text-foreground relative ">
                <CardTitle className="text-base font-semibold tracking-tight">
                  <Book className="inline mr-2 text-foreground" />
                  Share some Learnings
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground">
                  Distill complex concepts into clear, engaging posts that
                  educate, inform, and inspire your followers.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href={"/create/posts/tips"}>
            <Card className="group bg-gray-25 h-full overflow-hidden border-input transition-all hover:-translate-y-1 hover:shadow-sm relative">
              <CardContent className="flex h-[calc(100%-80px)] flex-col p-4 text-foreground relative ">
                <CardTitle className="text-base font-semibold tracking-tight">
                  <CircleInfo className="inline mr-2 text-foreground" />
                  Share a few tips
                </CardTitle>
                <p className="mt-2 flex-grow text-sm text-muted-foreground">
                  Craft concise, powerful tips that provide immediate value to
                  your audience, boosting engagement.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default PostsPage;

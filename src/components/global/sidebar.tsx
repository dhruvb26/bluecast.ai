"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Article,
  Brain,
  CalendarDots,
  CaretDown,
  Clock,
  Files,
  FolderSimple,
  Gear,
  Lightbulb,
  List,
  SignOut,
  TrendUp,
  UserSound,
  Wrench,
} from "@phosphor-icons/react";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, PenSquare } from "lucide-react";
import { Tour } from "@frigade/react";
import { v4 as uuid } from "uuid";
import { cn } from "@/lib/utils";
import WordsCard from "./words-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { checkValidity, getGeneratedWords, getUser } from "@/actions/user";
import { saveDraft } from "@/actions/draft";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [generatedWords, setGeneratedWords] = useState(0);
  const [validityDate, setValidityDate] = useState<string | null>(null);

  useEffect(() => {
    // Load the saved state from localStorage on the client side
    const savedIsOpen = localStorage.getItem("sidebarOpen");
    if (savedIsOpen !== null) {
      setIsOpen(JSON.parse(savedIsOpen));
    }
  }, []);
  const toggleSidebar = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    localStorage.setItem("sidebarOpen", JSON.stringify(newIsOpen));
  }, [isOpen]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const words = await getGeneratedWords();
        setGeneratedWords(words);
        const user = await getUser();
        const validity = user.trialEndsAt;
        if (validity) {
          setValidityDate(validity as any);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const isLinkActive = useCallback(
    (href: string, exact: boolean = false) => {
      return exact
        ? pathname === href
        : pathname === href || pathname.startsWith(href);
    },
    [pathname]
  );

  const renderNavLink = useCallback(
    (
      href: string,
      icon: React.ReactNode,
      regularIcon: React.ReactNode,
      text: string,
      exact: boolean = false,
      badge?: { text: string; color: string; icon?: React.ReactNode }
    ) => (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Link
              href={href}
              target={href.startsWith("https") ? "_blank" : ""}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-sm transition-all rounded-md",
                isOpen ? "justify-start" : "justify-center",
                isLinkActive(href, exact)
                  ? "text-foreground bg-gray-100 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
              )}
              id={text === "Post Generator" ? "tour-1" : undefined}
            >
              <span
                className={cn(
                  "transition-colors",
                  isLinkActive(href, exact)
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {isLinkActive(href, exact) ? regularIcon : icon}
              </span>
              {isOpen && (
                <span
                  className={cn(
                    "transition-colors",
                    isLinkActive(href, exact)
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {text}
                </span>
              )}
              {badge && isOpen && (
                <Badge variant="outline" className="ml-auto">
                  {badge.icon}
                  <span>{badge.text}</span>
                </Badge>
              )}
            </Link>
          </TooltipTrigger>
          {!isOpen && <TooltipContent side="right">{text}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    ),
    [isLinkActive, isOpen]
  );

  const handleCreateDraft = async () => {
    const id = uuid();
    await saveDraft(id, "");
    router.push(`/draft/${id}`);
  };

  const renderNavigation = () => (
    <ScrollArea className="flex-grow py-2 px-2 ">
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleCreateDraft}
            className={cn(
              "flex items-center px-2 bg-white font-semibold text-brand-gray-900 hover:bg-white w-full h-full",
              isOpen ? "justify-start" : "justify-center"
            )}
          >
            <Image
              src={
                isOpen
                  ? "/brand/Bluecast Logo.png"
                  : "/brand/Bluecast Symbol.png"
              }
              width={isOpen ? 130 : 20} // Adjust size if needed
              height={isOpen ? 130 : 20} // Adjust size if needed
              alt=""
              className={isOpen ? "" : "mx-auto"} // Center the image if it's a symbol
            />
          </Button>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  "w-full mb-2 rounded-lg bg-gradient-to-r to-brand-blue-secondary  from-brand-blue-primary  hover:from-blue-500 hover:to-blue-500 hover:via-blue-500 border border-blue-500 text-white shadow-md transition-all duration-300 flex items-center justify-center",
                  isOpen ? "px-5" : "px-2"
                )}
                onClick={handleCreateDraft}
              >
                <PenSquare size={18} className={isOpen ? "mx-1.5" : ""} />
                {isOpen && "Write Post"}
              </Button>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="right">Write Post</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        {/* <div className={cn("bg-input my-2", isOpen ? "h-[1px]" : "h-[1px]")} /> */}
        <div className="flex items-center justify-between mx-2">
          {isOpen && (
            <span className="mr-1 text-xs text-gray-400 mt-4 font-medium">
              CREATE
            </span>
          )}
        </div>
        {renderNavLink(
          "/create/posts",
          <Article size={20} className="text-gray-500" />,
          <Article
            size={20}
            className="text-brand-blue-primary"
            weight="regular"
          />,
          "Posts"
        )}
        {renderNavLink(
          "/create/ideas",
          <Lightbulb size={20} className="text-gray-500" />,
          <Lightbulb
            size={20}
            className="text-brand-blue-primary"
            weight="regular"
          />,
          "Ideas"
        )}
        {renderNavLink(
          "/create/inspiration",
          <TrendUp size={20} className="text-gray-500" />,
          <TrendUp
            size={20}
            className="text-brand-blue-primary"
            weight="regular"
          />,
          "Inspire"
        )}
        {renderNavLink(
          "/schedule",
          <CalendarDots size={20} className="text-gray-500" />,
          <CalendarDots
            size={20}
            className="text-brand-blue-primary"
            weight="regular"
          />,
          "Scheduler"
        )}
        <div className={cn("bg-input my-2", isOpen ? "h-[1px]" : "h-[1px]")} />
        {isOpen && (
          <div className="flex items-center mx-2">
            <span className="mr-1 text-xs text-gray-400 mt-4 font-medium">
              MANAGE
            </span>
          </div>
        )}
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsSavedOpen(!isSavedOpen)}
                variant="ghost"
                className={cn(
                  "flex w-full text-muted-foreground hover:text-muted-foreground hover:bg-gray-50 gap-2 items-center text-sm transition-all",
                  isOpen
                    ? "px-4 py-1.5 justify-between"
                    : "px-2 py-1.5 justify-center"
                )}
              >
                <div
                  className={cn(
                    "flex items-center py-1.5",
                    isOpen ? "gap-3" : ""
                  )}
                >
                  {isLinkActive("/saved") ? (
                    <FolderSimple
                      size={20}
                      className="text-blue-600 font-medium"
                      weight="duotone"
                    />
                  ) : (
                    <FolderSimple size={20} className="text-gray-500" />
                  )}
                  {isOpen && <span>Saved</span>}
                </div>
                {isOpen && (
                  <CaretDown
                    weight="bold"
                    className={`h-4 w-4 transition-transform ${
                      isSavedOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Button>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="right">Saved</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
        {isSavedOpen && (
          <div className={cn("ml-4 space-y-1", isOpen ? "" : "ml-0")}>
            {renderNavLink(
              "/saved/posts",
              <Files size={20} className="text-gray-500 " />,
              <Files size={20} className="text-blue-600" weight="regular" />,
              "Posts"
            )}
            {renderNavLink(
              "/saved/ideas",
              <Brain size={20} className="text-gray-500" />,
              <Brain size={20} className="text-blue-600" weight="regular" />,
              "Ideas"
            )}
            {renderNavLink(
              "/saved/lists",
              <List size={20} className="text-gray-500" />,
              <List size={20} className="text-blue-600" weight="regular" />,
              "Creator List"
            )}
            {renderNavLink(
              "/saved/styles",
              <UserSound size={20} className="text-gray-500" />,
              <UserSound
                size={20}
                className="text-blue-600"
                weight="regular"
              />,
              "Writing Styles"
            )}
          </div>
        )}
        <div className={cn("bg-input my-2", isOpen ? "h-[1px]" : "h-[1px]")} />
        {isOpen && (
          <div className="flex items-center mx-2">
            <span className="mr-1 text-xs text-gray-400 mt-4 font-medium">
              ACCOUNT
            </span>
          </div>
        )}
        {renderNavLink(
          "/preferences",
          <Wrench size={20} className="text-gray-500" />,
          <Wrench size={20} className="text-blue-600" weight="regular" />,
          "Preferences"
        )}
        {renderNavLink(
          "/settings",
          <Gear size={20} className="text-gray-500" />,
          <Gear size={20} className="text-blue-600" weight="regular" />,
          "Settings"
        )}
        {/* {renderNavLink(
          "",
          <SignOut size={20} className="text-gray-500" />,
          <SignOut size={20} className="text-blue-600" weight="regular" />,
          "Logout"
        )} */}
      </div>
    </ScrollArea>
  );

  return (
    <div className="flex h-screen flex-col overflow-auto">
      <Tour
        className="[&_.fr-title]:text-md [&_.fr-button-primary:hover]:bg-blue-700 [&_.fr-button-primary]:rounded-lg [&_.fr-button-primary]:bg-blue-600 [&_.fr-title]:font-semibold [&_.fr-title]:tracking-tight [&_.fr-title]:text-gray-900"
        flowId="flow_wqlim5Vq"
      />
      <div className="flex h-screen">
        <aside
          className={cn(
            "transition-all duration-300 flex-shrink-0 bg-white flex-col border-r border-gray-200 md:flex relative",
            isOpen ? "w-60" : "w-20"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-2 text-foreground rounded-full border border-input bg-white h-7 w-7 z-10"
            onClick={toggleSidebar}
          >
            {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          </Button>
          <div className="flex h-full flex-col">
            {renderNavigation()}

            <div className={`p-4 ${isOpen ? "" : "hidden"}`}>
              <WordsCard words={generatedWords} />
            </div>
          </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header
            className={`flex min-h-12 w-screen items-center justify-end border-b border-brand-gray-200 ${
              isOpen ? "pr-[16rem]" : "pr-[6rem]"
            }`}
          >
            {validityDate && (
              <div
                className="mr-4 text-sm text-primary
              "
              >
                <Clock size={16} weight="duotone" className="inline mr-1" />
                Your trial ends in{" "}
                {Math.ceil(
                  (new Date(validityDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days!
              </div>
            )}
            <UserButton
              appearance={{
                elements: {
                  userButtonPopoverCard: "shadow-sm border border-input",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

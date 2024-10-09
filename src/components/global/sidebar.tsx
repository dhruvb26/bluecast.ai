"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLineLeft,
  ArrowLineRight,
  Article,
  Brain,
  CalendarDots,
  CaretDown,
  Clock,
  CreditCard,
  Files,
  FolderSimple,
  Gear,
  GearSix,
  House,
  Lightbulb,
  List,
  ListBullets,
  Rows,
  SidebarSimple,
  SignOut,
  TrendUp,
  UserSound,
  Wrench,
} from "@phosphor-icons/react";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  DotIcon,
  Menu,
  PenSquare,
} from "lucide-react";
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
import { env } from "@/env";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [generatedWords, setGeneratedWords] = useState(0);
  const [validityDate, setValidityDate] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = useCallback(() => {
    if (window.innerWidth < 768) {
      // Check if it's a mobile screen
      setIsOpen(false); // Always close the sidebar on mobile
      setIsMobileMenuOpen((prev) => !prev); // Toggle mobile menu
    } else {
      setIsOpen((prev) => !prev); // Toggle sidebar on larger screens
    }
  }, []);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
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
    setIsMobileMenuOpen(newIsOpen); // Also toggle mobile menu
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
      if (href === "/settings" && pathname === "/pricing") {
        return true;
      }
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
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50",
                text == "Dashboard" ? "mt-4" : ""
              )}
              id={text === "Post Generator" ? "tour-1" : undefined}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileMenuOpen(false);
                }
              }}
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
              isOpen ? "justify-center" : "justify-center"
            )}
          >
            <Image
              src={
                isOpen
                  ? "/brand/Bluecast Logo.png"
                  : "/brand/Bluecast Symbol.png"
              }
              width={isOpen ? 140 : 20} // Adjust size if needed
              height={isOpen ? 140 : 20} // Adjust size if needed
              alt=""
              className={isOpen ? "" : "mx-auto"} // Center the image if it's a symbol
            />
          </Button>
        </div>
        <div className="flex flex-col space-y-2">
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
          {renderNavLink(
            "/dashboard",
            <House size={20} className="text-gray-500" />,
            <House
              size={20}
              className="text-brand-blue-primary"
              weight="regular"
            />,
            "Dashboard"
          )}
        </div>
        <div className="flex items-center justify-between  mx-2">
          {isOpen && (
            <span className="mr-1 text-xs text-gray-400  mt-2  font-medium">
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
              <Rows size={20} className="text-gray-500" />,
              <Rows size={20} className="text-blue-600" weight="regular" />,
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
      <div className="flex h-screen">
        <aside
          className={cn(
            "transition-all duration-300 flex-shrink-0 bg-white flex-col border-r border-gray-200 md:flex",
            isOpen ? "w-60" : "w-20",
            "fixed inset-y-0 left-0 z-40",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            "md:relative md:translate-x-0"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute text-foreground rounded-full border border-input bg-white h-7 w-7",
              isOpen
                ? "-right-3 top-2"
                : "left-[4.5rem] top-2 md:left-auto md:-right-3",
              isMobileMenuOpen ? "z-50" : "z-50 md:z-10",
              !isOpen && !isMobileMenuOpen ? "left-3 md:left-auto" : "",
              "hidden md:flex" // Hide on mobile
            )}
            onClick={toggleSidebar}
          >
            {isOpen || (!isOpen && isMobileMenuOpen) ? (
              <ChevronLeft size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </Button>
          <div className="flex h-full flex-col">
            {renderNavigation()}

            <div className={`p-4 ${isOpen ? "" : "hidden"}`}>
              <WordsCard />
            </div>
          </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex min-h-12 items-center justify-between border-b border-brand-gray-200 px-4">
            <div className="flex items-center">
              <Button
                size="icon"
                className={cn(
                  "md:hidden", // Only show on mobile
                  isMobileMenuOpen ? "ml-[4.5rem]" : "ml-0", // Add left padding when sidebar is open
                  "transition-all duration-300" // Smooth transition for padding change
                )}
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <List size={18} /> : <List size={18} />}
              </Button>
            </div>
            <div className="flex items-center ml-auto">
              {" "}
              {/* Keep these items on the right */}
              {validityDate && (
                <Link href={"/pricing"}>
                  <div className="mr-4 text-sm text-primary hidden sm:block">
                    {" "}
                    {/* Hide on very small screens */}
                    <Clock size={16} weight="duotone" className="inline mr-1" />
                    Your trial ends in{" "}
                    {Math.ceil(
                      (new Date(validityDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days!
                  </div>
                </Link>
              )}
              <UserButton
                appearance={{
                  elements: {
                    userButtonTrigger__open: "rounded-md",
                    userButtonPopoverActionButton__manageAccount: "hidden",
                    userButtonPopoverCard: "shadow-sm border border-input",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Settings"
                    labelIcon={<GearSix size={15} weight="fill" />}
                    onClick={() => router.push("/settings")}
                  />
                </UserButton.MenuItems>
                {/* <UserButton.MenuItems>
                  <UserButton.Action
                    label="Manage Subscription"
                    labelIcon={<CreditCard size={15} weight="fill" />}
                    onClick={() =>
                      router.push(
                        env.NEXT_PUBLIC_NODE_ENV === "development"
                          ? "https://billing.stripe.com/p/login/test_aEU00F2YO3cF11eeUU"
                          : "https://billing.stripe.com/p/login/4gw9EzeXq3oe4N2dQQ"
                      )
                    }
                  />
                </UserButton.MenuItems> */}
              </UserButton>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto w-full">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDrafts } from "@/actions/draft";
import { parseContent } from "@/utils/editor-utils";
import { toast } from "sonner";
import { Draft } from "@/actions/draft";
import { Folder, HardDrives, Moon, Plus, Sun } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { DatePicker } from "./date-picker";
import { Input } from "../ui/input";
import { getLinkedInId } from "@/actions/user";
import { usePostStore } from "@/store/post";
import { useRouter } from "next/navigation";
import { PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function SchedulePostDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [editedDraft, setEditedDraft] = useState<string | null>(null);
  const { showLinkedInConnect, setShowLinkedInConnect } = usePostStore();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    const result = await getDrafts("saved");
    if (result.success) {
      setDrafts(result.data || []);
    } else {
      toast.error(result.error);
    }
  };

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedDraft(e.target.value);
  };
  const router = useRouter();

  const renderDraftList = () => (
    <div className="flex h-[500px] w-full">
      <ScrollArea className="w-1/2 pr-4">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className={`mb-4 rounded-md p-4 transition-all duration-200 cursor-pointer ${
              selectedDraft?.id === draft.id
                ? "bg-blue-50 border border-blue-200"
                : "bg-white border border-input"
            }`}
            onClick={() => {
              setSelectedDraft(draft);
              setEditedDraft(parseContent(draft.content || ""));
            }}
          >
            <div className="flex flex-row justify-between w-full">
              <div className="mb-2 text-sm font-semibold">
                {draft.name || "Untitled"}
                <span className="text-xs text-gray-500 mb-2">
                  {" "}
                  Last updated: {new Date(draft.updatedAt).toLocaleString()}
                </span>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"sm"}
                      className="to-brand-blue-secondary  from-brand-blue-primary bg-gradient-to-r border-blue-500 shadow-md border"
                      onClick={() => router.push(`/draft/${draft.id}`)}
                    >
                      <PenSquare size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-sm mb-2">
              {parseContent(draft.content || "")}
            </pre>
          </div>
        ))}
      </ScrollArea>
      <div className="w-1/2 px-4 h-full flex flex-col justify-between">
        <div className="flex flex-col space-y-5 py-4 justify-center">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="postName">Name</Label>
            <Input
              id="postName"
              value={selectedDraft?.name || ""}
              onChange={(e) =>
                setSelectedDraft((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              placeholder="Choose a name"
            />
          </div>
          <div className="flex flex-col space-y-1.5 ">
            <Label htmlFor="date-time">Date & Time</Label>
            <div className="flex space-y-2 flex-col">
              <DatePicker selected={scheduleDate} onSelect={handleDateChange} />
              <div className="flex space-x-2">
                <Select value={scheduleHours} onValueChange={handleHoursChange}>
                  <SelectTrigger className="">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem
                        key={hour}
                        value={hour.toString().padStart(2, "0")}
                      >
                        {hour.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex items-center">:</span>
                <Select
                  value={scheduleMinutes}
                  onValueChange={handleMinutesChange}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem
                        key={minute}
                        value={minute.toString().padStart(2, "0")}
                      >
                        {minute.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isPM}
                    onCheckedChange={setIsPM}
                    id="am-pm-toggle"
                  />
                  <Label htmlFor="am-pm-toggle" className="flex items-center">
                    {isPM ? (
                      <>
                        <Moon
                          className="mr-1 text-blue-600"
                          size={16}
                          weight="duotone"
                        />
                        PM
                      </>
                    ) : (
                      <>
                        <Sun
                          className="mr-1 text-yellow-500"
                          size={16}
                          weight="duotone"
                        />
                        AM
                      </>
                    )}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={timezone}
              onValueChange={(value) => setTimezone(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full"
            type="submit"
            onClick={handleSchedule}
            loading={isLoading}
          >
            {isLoading ? "Scheduling" : "Schedule"}
          </Button>
        </div>

        <div className="flex flex-row space-x-2 h-fit items-center justify-center">
          <Button className="w-full" variant={"outline"}>
            <Folder size={18} className="mx-1.5" />
            Saved Posts
          </Button>
          <Button className="w-full">
            <PenSquare size={18} className="mx-1.5" />
            Write Post
          </Button>
        </div>
      </div>
    </div>
  );

  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleHours, setScheduleHours] = useState("");
  const [scheduleMinutes, setScheduleMinutes] = useState("");
  const [isPM, setIsPM] = useState(false);
  const [timezone, setTimezone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (date: Date | undefined) => {
    setScheduleDate(date);
  };

  const handleHoursChange = (value: string) => {
    setScheduleHours(value);
  };

  const handleMinutesChange = (value: string) => {
    setScheduleMinutes(value);
  };

  const handleSchedule = async () => {
    if (
      !scheduleDate ||
      !scheduleHours ||
      !scheduleMinutes ||
      !timezone ||
      !selectedDraft
    ) {
      console.error("Please fill in all fields");
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const linkedInAccount = await getLinkedInId();
      if (!linkedInAccount || linkedInAccount.length === 0) {
        setIsLoading(false);

        setIsDialogOpen(false);
        setShowLinkedInConnect(true);
        return;
      }
    } catch (error) {
      console.error("Error getting LinkedIn ID:", error);
      toast.error(
        "Failed to retrieve LinkedIn account information. Please try again."
      );

      setIsLoading(false);

      setIsDialogOpen(false);
      setShowLinkedInConnect(true);
      return;
    }

    try {
      interface ScheduleData {
        name: string;
        postId: string;
        scheduledTime: string;
        timezone: string;
      }

      let hours = parseInt(scheduleHours);
      const minutes = parseInt(scheduleMinutes);

      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }

      const scheduledDate = new Date(scheduleDate);
      scheduledDate.setHours(hours, minutes);

      const scheduleData: ScheduleData = {
        name: selectedDraft.name,
        postId: selectedDraft.id,
        scheduledTime: scheduledDate.toISOString(),
        timezone: timezone,
      };

      const response = await fetch(`/api/schedule`, {
        method: "POST",
        body: JSON.stringify(scheduleData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Draft scheduled successfully.");
      } else {
        toast.error("Failed to schedule draft.");
      }
    } catch (error) {
      console.error("Error scheduling draft:", error);
      toast.error("An error occurred while scheduling the draft.");
    } finally {
      setIsLoading(false);
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const timezones = Intl.supportedValuesOf("timeZone");

  useEffect(() => {
    // Set the default timezone to the local timezone
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(localTimezone);
  }, []);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Schedule</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogTrigger>

        <DialogContent className="min-h-[80vh] sm:max-w-[1000px] gap-0 space-y-0">
          <DialogHeader className="mb-0 ">
            <DialogTitle className="text-lg font-semibold tracking-tight text-black">
              Schedule Posts
            </DialogTitle>
            <DialogDescription className="text-sm font-normal text-gray-500">
              View all your drafts and schedule them for future publication.
            </DialogDescription>
          </DialogHeader>
          {renderDraftList()}
        </DialogContent>
      </Dialog>
    </>
  );
}

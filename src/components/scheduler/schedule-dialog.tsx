"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DatePicker } from "./date-picker";
import { extractContent } from "../draft/editor-section";
import { CalendarBlank, Moon, Sun } from "@phosphor-icons/react";
import { CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DialogDescription } from "@radix-ui/react-dialog";

interface ScheduleDialogProps {
  id: string;
  disabled: boolean;
}

const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ id, disabled }) => {
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [postName, setPostName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleHours, setScheduleHours] = useState("");
  const [scheduleMinutes, setScheduleMinutes] = useState("");
  const [isPM, setIsPM] = useState(false);
  const router = useRouter();
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    // Set the default timezone to the local timezone
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(localTimezone);
  }, []);

  const handleSchedule = async () => {
    if (
      !scheduleDate ||
      !scheduleHours ||
      !scheduleMinutes ||
      !timezone ||
      !postName
    ) {
      console.error("Please fill in all fields");
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

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
        name: postName,
        postId: id,
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

  const handleDateChange = (date: Date | undefined) => {
    setScheduleDate(date);
  };

  const handleHoursChange = (value: string) => {
    setScheduleHours(value);
  };

  const handleMinutesChange = (value: string) => {
    setScheduleMinutes(value);
  };
  const [isOpen, setIsOpen] = useState(false);

  const handleCancel = () => {
    setIsOpen(false);
  };

  const timezones = Intl.supportedValuesOf("timeZone");

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <CalendarBlank className="mr-2 h-4 w-4" />
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[550px]">
        <DialogHeader className="flex flex-row space-x-2">
          <div className="flex items-center justify-center border border-input rounded-lg p-3 h-fit mt-2 shadow-sm">
            <CalendarPlus className="inline" size={20} />
          </div>
          <div className="flex flex-col">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Schedule Post
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below to schedule the post.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="postName">Name</Label>
            <Input
              id="postName"
              value={postName}
              onChange={(e) => setPostName(e.target.value)}
              placeholder="Choose a name"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
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
            onClick={handleSchedule}
            loading={isLoading}
          >
            {isLoading ? "Scheduling" : "Schedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDialog;

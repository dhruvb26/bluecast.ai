"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DraftCard from "./draft-card";
import { Draft } from "@/actions/draft";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { SchedulePostDialog } from "./schedule-post-dialog";

interface CalendarProps {
  drafts: Draft[];
}

const Calendar: React.FC<CalendarProps> = ({ drafts }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<"1week" | "2weeks" | "month">(
    "1week"
  );

  const getWeekDates = (date: Date, weeks: number = 1): Date[] => {
    const dates: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7 * weeks; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getMonthDates = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates: Date[] = [];

    // Add days from previous month to start on Sunday
    for (let i = firstDay.getDay(); i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      dates.push(prevDate);
    }

    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }

    // Add days from next month to complete the grid
    const remainingDays = 7 - (dates.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        dates.push(new Date(year, month + 1, i));
      }
    }

    return dates;
  };

  const formatDates = (date: Date): React.ReactNode => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (d: Date) =>
      d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    return (
      <span className="text-sm text-muted-foreground">
        {formatDate(startOfWeek)} - {formatDate(endOfWeek)}
      </span>
    );
  };

  const formatMonthYearWeek = (date: Date): React.ReactNode => {
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();

    return (
      <span className="text-xl font-semibold items-center flex tracking-tight">
        {month} {year}
      </span>
    );
  };

  const formatDayOfWeek = (date: Date): string => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDayOfMonth = (date: Date): number => {
    return date.getDate();
  };

  const goToPrevious = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (currentView === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - (currentView === "1week" ? 7 : 14));
      }
      return newDate;
    });
  };

  const goToNext = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (currentView === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + (currentView === "1week" ? 7 : 14));
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDraftsForDate = (date: Date): Draft[] => {
    return drafts.filter(
      (draft) =>
        draft.scheduledFor &&
        new Date(draft.scheduledFor).toDateString() === date.toDateString()
    );
  };
  const renderCalendarView = () => {
    const dates =
      currentView === "month"
        ? getMonthDates(currentDate)
        : getWeekDates(currentDate, currentView === "1week" ? 1 : 2);
    const today = new Date().toDateString();
    const now = new Date();

    const timeChunks = Array.from(
      { length: 8 },
      (_, i) => `${(i * 3).toString().padStart(2, "0")}:00`
    );

    return (
      <div className="flex mx-4 border border-input rounded-md h-[calc(100vh-100px)]">
        <div className="flex flex-grow overflow-hidden">
          {/* Time column */}
          <div className="flex-none w-16 bg-gray-50 border-r border-input">
            {timeChunks.map((time, i) => (
              <div
                key={i}
                className="h-[calc((100vh-100px)/8)] flex items-end justify-end pr-2 pb-1"
              >
                <span className="text-xs text-gray-400">{time}</span>
              </div>
            ))}
          </div>
          {/* Days columns */}
          <div className="flex-grow overflow-y-auto">
            <div
              className={`grid ${
                currentView === "month" ? "grid-cols-7" : "grid-cols-7"
              } gap-px bg-gray-100 h-[calc(8*(100vh-100px)/8)]`}
            >
              {dates.map((date, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    date.toDateString() === today ? "bg-gray-25" : "bg-white"
                  }`}
                >
                  <div
                    className={`sticky top-0 z-10 flex-shrink-0 h-14 items-center justify-center ${
                      date.toDateString() === today
                        ? "border-blue-600 border-b p-4"
                        : "bg-white p-4 border-b border-input"
                    }`}
                  >
                    <div className="flex flex-row space-x-2 items-center justify-center h-full">
                      <div
                        className={`text-sm font-normal ${
                          date.toDateString() === today
                            ? "text-blue-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatDayOfWeek(date)}
                      </div>
                      <div
                        className={`text-sm ${
                          date.toDateString() === today ? "text-blue-600" : ""
                        }`}
                      >
                        {formatDayOfMonth(date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow relative">
                    {timeChunks.map((_, i) => (
                      <div
                        key={i}
                        className="h-[calc((100vh-100px)/8)] border-b border-gray-200"
                      />
                    ))}
                    {getDraftsForDate(date).map((draft) => {
                      if (!draft.scheduledFor) return null;
                      const draftTime = new Date(draft.scheduledFor);
                      const hours = draftTime.getHours();
                      const minutes = draftTime.getMinutes();
                      const topPercentage =
                        ((hours * 60 + minutes) / (24 * 60)) * 100;

                      return (
                        <DraftCard
                          key={draft.id}
                          draft={draft}
                          view={currentView}
                          style={{
                            position: "absolute",
                            top: `${topPercentage}%`,
                            left: "2px",
                            right: "2px",
                          }}
                        />
                      );
                    })}
                    {date.toDateString() === today && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-blue-400 z-40"
                        style={{
                          top: `${
                            ((now.getHours() * 60 + now.getMinutes()) /
                              (24 * 60)) *
                            100
                          }%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container min-h-screen pb-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-col space-y-2 p-4">
          <div className="flex flex-row space-x-2">
            {formatMonthYearWeek(currentDate)}
            <Button variant={"outline"} onClick={goToToday} className="text-sm">
              Today
            </Button>
            <div className="flex flex-row items-center">
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={goToPrevious}
                className="rounded-full"
              >
                <ChevronLeft size={20} />
              </Button>

              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={goToNext}
                className="rounded-full"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
          <>{formatDates(currentDate)}</>
        </div>

        <div className="flex items-center space-x-4">
          <SchedulePostDialog />
          <Separator orientation="vertical" className="h-10" />
          <Tabs
            className="mr-6"
            value={currentView}
            onValueChange={(value) =>
              setCurrentView(value as "1week" | "2weeks" | "month")
            }
          >
            <TabsList className="grid grid-cols-3  text-sm">
              <TabsTrigger value="1week">1 Week</TabsTrigger>
              <TabsTrigger value="2weeks">2 Weeks</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {renderCalendarView()}
    </div>
  );
};

export default Calendar;

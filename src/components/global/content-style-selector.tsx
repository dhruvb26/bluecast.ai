"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getContentStyles, ContentStyle } from "@/actions/style";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
export function ContentStyleSelector({
  onSelectStyle,
}: {
  onSelectStyle: (styleId: string) => void;
}) {
  const [styles, setStyles] = useState<ContentStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchStyles = async () => {
    setIsLoading(true);
    try {
      const [privateResult, publicResult] = await Promise.all([
        getContentStyles(false),
        getContentStyles(true),
      ]);
      if (privateResult.success && publicResult.success) {
        setStyles([
          ...(privateResult.data || []),
          ...(publicResult.data || []),
        ]);
      } else {
        toast.error("Failed to fetch styles");
      }
    } catch (error) {
      console.error("Error fetching styles:", error);
      toast.error("An error occurred while fetching styles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleChange = (value: string) => {
    if (value === "custom") {
      router.push("/saved/styles");
    } else {
      setSelectedStyleId(value);
      onSelectStyle(value);
    }
  };

  return (
    <div className="space-y-4">
      <Select
        onValueChange={handleStyleChange}
        value={selectedStyleId || undefined}
        onOpenChange={(open) => {
          if (open && styles.length === 0) {
            fetchStyles();
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a writing style" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : (
            <>
              {styles.map((style) => (
                <SelectItem className="text-sm" key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
              <DropdownMenuSeparator />
              <SelectItem
                className="text-sm pl-2  focus:bg-blue-600 transition-all focus:text-white"
                value="custom"
                hideIndicator={true}
              >
                <Plus className="inline mr-1" size={16} />
                Create New
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

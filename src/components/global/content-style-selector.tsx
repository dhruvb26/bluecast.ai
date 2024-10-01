"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getContentStyles, ContentStyle } from "@/actions/style";
import CustomLoader from "./custom-loader";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

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
    const result = await getContentStyles(false);
    if (result.success) {
      setStyles(result.data || []);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
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
              <CustomLoader className="text-foreground" />
            </div>
          ) : (
            <>
              {styles.map((style) => (
                <SelectItem className="text-sm" key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
              <SelectItem
                className="text-sm pl-2 bg-gray-100 focus:bg-blue-600 transition-all focus:text-white"
                value="custom"
                hideIndicator={true}
              >
                <Plus className="inline mr-1 w-4 h-4" />
                Create New
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

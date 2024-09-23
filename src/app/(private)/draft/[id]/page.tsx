"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { createEditor, Descendant } from "slate";
import { withReact } from "slate-react";
import { getDraft, saveDraft } from "@/actions/draft";
import LinkedInPostPreview from "@/components/draft/post-preview";
import { toast } from "sonner";
import EditorSection from "@/components/draft/editor-section";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { withHistory } from "slate-history";
import { deserializeContent } from "@/utils/editor-utils";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

export default function EditDraft() {
  const params = useParams();
  const id = params.id as string;
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const [fileType, setFileType] = useState(null);

  const [documentUrn, setDocumentUrn] = useState<string | null>(null);
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">(
    "mobile"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const fetchDraft = async () => {
      setIsLoading(true);
      try {
        const draft = await getDraft(id);
        if (draft.success && draft.data) {
          let newValue: Descendant[];
          if (typeof draft.data.content === "string") {
            try {
              newValue = deserializeContent(draft.data.content);
            } catch (e) {
              newValue = [
                { type: "paragraph", children: [{ text: draft.data.content }] },
              ];
            }
          } else {
            newValue = draft.data.content || initialValue;
          }

          editor.children = newValue;
          editor.onChange();
          setValue(newValue);

          setDocumentUrn(draft.data.documentUrn || null);
          setUpdatedAt(
            draft.data.updatedAt ? new Date(draft.data.updatedAt) : null
          );
        } else {
          setValue(initialValue);
          setDocumentUrn(null);
          setUpdatedAt(null);
        }
      } catch (error) {
        console.error("Error fetching draft:", error);
        toast.error("An unexpected error occurred while loading the draft.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraft();
  }, [id, editor]);

  const saveContent = useCallback(
    async (showToast: boolean = false) => {
      try {
        const result = await saveDraft(id, value);
        if (result.success) {
          setUpdatedAt(new Date());
          if (showToast) {
            toast.success("Draft saved successfully.");
          }
        } else {
          if (showToast) {
            toast.error("Failed to save draft.");
          }
        }
      } catch (error) {
        console.error("Error saving draft:", error);
        if (showToast) {
          toast.error("An error occurred while saving the draft.");
        }
      }
    },
    [id, value]
  );

  const handleSave = () => saveContent(true);

  useEffect(() => {
    const autoSave = () => {
      saveContent();
    };

    const autoSaveInterval = setInterval(autoSave, 60000); // Auto-save every minute

    return () => clearInterval(autoSaveInterval);
  }, [saveContent]);

  return (
    <main className="flex h-screen ">
      {isLoading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="ml-1 inline-block h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="flex w-full flex-col h-full lg:flex-row">
          <div className="w-full lg:w-1/2 h-full border-r border-input">
            <EditorSection
              id={id}
              initialValue={value}
              setValue={setValue}
              editor={editor}
              handleSave={handleSave}
              initialDocumentUrn={documentUrn}
              setFileType={setFileType}
              updateAt={updatedAt}
            />
          </div>

          <div className="w-full lg:w-1/2 bg-blue-50 h-screen overflow-y-visible">
            <LinkedInPostPreview postId={id} content={value} device={device} />
          </div>
        </div>
      )}
    </main>
  );
}

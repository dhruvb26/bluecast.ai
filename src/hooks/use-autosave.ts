import { useEffect } from "react";
import { Descendant } from "slate";
import { saveDraft } from "@/actions/draft";
import { useEditorStore } from "@/store/editor";

export const useAutoSave = (id: string) => {
  const value = useEditorStore((state) => state.value);
  const setUpdatedAt = useEditorStore((state) => state.setUpdatedAt);

  useEffect(() => {
    const autoSave = async () => {
      await saveDraft(id, value);
      setUpdatedAt(new Date());
    };
    const autoSaveInterval = setInterval(autoSave, 60000);
    return () => clearInterval(autoSaveInterval);
  }, [id, value, setUpdatedAt]);
};

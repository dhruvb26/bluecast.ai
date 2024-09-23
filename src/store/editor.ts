// store.ts
import create from "zustand";
import { Descendant } from "slate";
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

// Define CustomElement type
type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
interface EditorState {
  value: Descendant[];
  setValue: (value: Descendant[]) => void;
  documentUrn: string | null;
  setDocumentUrn: (urn: string | null) => void;
  isPublishing: boolean;
  setIsPublishing: (isPublishing: boolean) => void;
  charCount: number;
  setCharCount: (count: number) => void;
  updatedAt: Date | null;
  setUpdatedAt: (date: Date | null) => void;
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
] as Descendant[];

export const useEditorStore = create<EditorState>((set) => ({
  value: initialValue,
  setValue: (value) => set({ value }),
  documentUrn: null,
  setDocumentUrn: (urn) => set({ documentUrn: urn }),
  isPublishing: false,
  setIsPublishing: (isPublishing) => set({ isPublishing }),
  charCount: 0,
  setCharCount: (count) => set({ charCount: count }),
  updatedAt: null,
  setUpdatedAt: (date) => set({ updatedAt: date }),
}));

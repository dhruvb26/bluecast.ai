import {
  Descendant,
  BaseEditor,
  Element as SlateElement,
  Editor,
  Text,
  Transforms,
} from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export const serializeContent = (nodes: Descendant[]): string => {
  return JSON.stringify(nodes);
};

export const deserializeContent = (content: string): Descendant[] => {
  return JSON.parse(content) as Descendant[];
};

export const parseContent = (content: string | null): string => {
  if (!content) return "";

  return deserializeContent(content)
    .map((node) => {
      if (typeof node === "object" && "children" in node) {
        return node.children
          .map((child) => {
            if (typeof child === "object" && "text" in child) {
              return child.text;
            }
            return "";
          })
          .join("");
      }
      return "";
    })
    .join("\n");
};

export const extractContent = (value: Descendant[]): string => {
  return value
    .map((n) =>
      SlateElement.isElement(n) ? n.children.map((c) => c.text).join("") : ""
    )
    .join("");
};

export const CustomEditor = {
  isBoldMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  toggleBoldMark(editor: CustomEditor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },

  isItalicMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },

  toggleItalicMark(editor: CustomEditor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "italic");
    } else {
      Editor.addMark(editor, "italic", true);
    }
  },

  isUnderlineMarkActive(editor: CustomEditor) {
    const marks = Editor.marks(editor);
    return marks ? marks.underline === true : false;
  },

  toggleUnderlineMark(editor: CustomEditor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "underline");
    } else {
      Editor.addMark(editor, "underline", true);
    }
  },
};

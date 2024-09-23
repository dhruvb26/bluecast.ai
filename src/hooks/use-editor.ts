import { useMemo } from "react";
import { createEditor, Descendant } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";

export const useEditor = () => {
  return useMemo(() => withHistory(withReact(createEditor())), []);
};

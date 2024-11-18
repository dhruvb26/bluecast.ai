import { create } from "zustand";

interface Workspace {
  id: string | null;
  name: string;
  logo: React.ReactNode;
  plan: string;
}

interface UserStore {
  workspaces: Workspace[]; // Add this to store all available workspaces
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void; // Add this to update the list
}

export const useUserStore = create<UserStore>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}));

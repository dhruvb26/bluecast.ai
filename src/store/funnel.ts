import { create } from "zustand";

interface FunnelTemplate {
    name: string;
    prompt: string;
    funnel_location: string;
  }
  
  interface FunnelStore {
    funnelTemplate: FunnelTemplate | null;
    setFunnelTemplate: (template: FunnelTemplate) => void;
  }
  
  export const useFunnelStore = create<FunnelStore>((set) => ({
    funnelTemplate: null,
    setFunnelTemplate: (template) => set({ funnelTemplate: template }),
  }));
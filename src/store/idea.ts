import { create } from "zustand";

interface IdeasState {
  ideas: string[];
  isLoading: boolean;
  setIdeas: (ideas: string[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  generateIdeas: (topic: string) => Promise<void>;
}

export const useIdeasStore = create<IdeasState>((set) => ({
  ideas: [],
  isLoading: false,
  setIdeas: (ideas) => set({ ideas }),
  setIsLoading: (isLoading) => set({ isLoading }),
  generateIdeas: async (topic) => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/ai/ideas", {
        method: "POST",
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate ideas");
      }
      const data: any = await response.json();
      if (data.success && Array.isArray(data.data)) {
        set({ ideas: data.data });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

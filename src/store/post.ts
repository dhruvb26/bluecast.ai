// store.ts
import { getGeneratedPosts, getUser } from "@/actions/user";
import { toast } from "sonner";
import { create } from "zustand";

interface PostStore {
  linkedInPost: string;
  isLoading: boolean;
  isGeneratingInstructions: boolean;
  error: string | any;
  isStreamComplete: boolean;
  linkedInPostInstructions: string;
  resetPostData: () => void; // Add this new function
  setLinkedInPostInstructions: (
    update: string | ((prev: string) => string)
  ) => void;
  setLinkedInPost: (update: string | ((prev: string) => string)) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsGeneratingInstructions: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  setIsStreamComplete: (isComplete: boolean) => void;
  handleSubmit: (path: string, data: any) => Promise<void>;
  handleGenerateInstructions: (data: any) => Promise<void>;
  showLinkedInConnect: boolean;
  setShowLinkedInConnect: (show: boolean) => void;
  showFeatureGate: boolean;
  setShowFeatureGate: (show: boolean) => void;
  submissionSuccessful: boolean;
  setSubmissionSuccessful: (successful: boolean) => void;
  wordsGenerated: number;
  setWordsGenerated: (words: number) => void;
}

export const usePostStore = create<PostStore>((set) => ({
  showFeatureGate: false,
  wordsGenerated: 0,
  setWordsGenerated: (words) => set({ wordsGenerated: words }),
  submissionSuccessful: false,
  setSubmissionSuccessful: (successful) =>
    set({ submissionSuccessful: successful }),
  setShowFeatureGate: (show) => set({ showFeatureGate: show }),
  showLinkedInConnect: false,
  setShowLinkedInConnect: (show) => set({ showLinkedInConnect: show }),
  linkedInPost: "",
  linkedInPostInstructions: "",
  isLoading: false,
  isGeneratingInstructions: false,
  error: null,
  isStreamComplete: false,
  setLinkedInPostInstructions: (update) =>
    set((state) => ({
      linkedInPostInstructions:
        typeof update === "function"
          ? update(state.linkedInPostInstructions)
          : update,
    })),
  resetPostData: () =>
    set({
      linkedInPost: "",
      linkedInPostInstructions: "",
      isStreamComplete: false,
      error: null,
    }),

  setLinkedInPost: (update) =>
    set((state) => ({
      linkedInPost:
        typeof update === "function" ? update(state.linkedInPost) : update,
    })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsGeneratingInstructions: (isGenerating) =>
    set({ isGeneratingInstructions: isGenerating }),
  setError: (error) => set({ error }),
  setIsStreamComplete: (isComplete) => set({ isStreamComplete: isComplete }),
  handleSubmit: async (path, data) => {
    set({
      isLoading: true,
      error: null,
      linkedInPost: "",
      isStreamComplete: false,
      submissionSuccessful: false,
    });

    try {
      const user = await getUser(); // You'll need to import this function
      const generatedPosts = await getGeneratedPosts(); // You'll need to import this function

      if (user.specialAccess && generatedPosts >= 10) {
        // User has hit the limit
        toast.error(
          "You've hit the post limit. Please upgrade your plan for more content generation."
        );
        set({
          isLoading: false,
          error: {
            message: "Post limit reached.",
            cause: "limit",
          },
        });
        return;
      }

      const response = await fetch(`/api/ai/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: any = await response.json();

        if (response.status === 401) {
          toast.error(
            "You've hit your usage limits. Limits reset every first day of the month."
          );
          set({
            isLoading: false,
            error: {
              message:
                errorData.error ||
                "You've hit your usage limits. Limits reset every first day of the month.",
              cause: "usage",
            },
          });
          return;
        }
        if (path === "repurpose/blog") {
          const errorData = await response.json();
          throw new Error("Failed to submit. Try again later.", {
            cause: "blog",
          });
        } else {
          throw new Error("Failed to submit. Try again later.");
        }
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to read response");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          set({
            isStreamComplete: true,
            isLoading: false,
            submissionSuccessful: true,
          }); // Set to true on successful completion
          break;
        }
        const chunkText = decoder.decode(value);
        set((state) => ({ linkedInPost: state.linkedInPost + chunkText }));
      }
    } catch (error) {
      if (error instanceof Error) {
        set({
          error: {
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            cause: error instanceof Error ? (error.cause as string) : "unknown",
          },
          isLoading: false,
          submissionSuccessful: false, // Ensure it's false on error
        });
      } else {
        set({
          error: {
            message: "An unexpected error occurred",
            cause: "unknown",
          },
          isLoading: false,
        });
      }
    }
  },
  handleGenerateInstructions: async (data) => {
    set({
      isGeneratingInstructions: true,
      error: null,
      linkedInPostInstructions: "",
      isStreamComplete: false,
    });

    try {
      const response = await fetch(`/api/ai/instructions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to generate instructions");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to read response");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          set({ isStreamComplete: true, isGeneratingInstructions: false });
          break;
        }
        const chunkText = decoder.decode(value);
        set((state) => ({
          linkedInPostInstructions: state.linkedInPostInstructions + chunkText,
        }));
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "An error occurred",
        isGeneratingInstructions: false,
      });
      console.error("Error generating instructions:", err);
    }
  },
}));

interface UploadState {
  url: string;
  setUrl: (url: string) => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  url: "",
  setUrl: (url) => set({ url }),
}));

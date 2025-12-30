import { FlashCardsApi } from "@/api/flashcards";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateFlashCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: FlashCardsApi.createFlashCards,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId, "flashcards"],
      });
    },
    onError: (error) => {
      console.error("Flash cards creation failed:", error);
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import { FlashCardsApi } from "@/api/flashcards";

export const useGetFlashCards = (conversationId: string) => {
  return useQuery({
    queryFn: async () => {
      const res = await FlashCardsApi.getFlashCards(conversationId);
      return res.data;
    },
    queryKey: ["conversations", conversationId, "flashcards"],
  });
};

import { GetFlashCardsResponse } from "@/types/flashcard.types";
import { BASE_API_URL } from ".";

const createFlashCards = async (conversationId: string) => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/flashcards`, BASE_API_URL),
    {
      method: "post",
      body: JSON.stringify({ conversationId }),
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Failed to create flash cards");

  return res.json();
};

const getFlashCards = async (
  conversationId: string,
): Promise<{ data: GetFlashCardsResponse }> => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/flashcards`, BASE_API_URL),
    {
      method: "get",
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Failed to get flash cards");

  return res.json();
};

export const FlashCardsApi = {
  createFlashCards,
  getFlashCards,
};

import { GetFlashCardsResponse } from "@/types/flashcard.types";
import { BASE_API_URL } from ".";
import { MindMap } from "@/types/mindmap.types";

const createMindMap = async (conversationId: string) => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/mindmap`, BASE_API_URL),
    {
      method: "post",
      body: JSON.stringify({ conversationId }),
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Failed to create mind map");

  return res.json();
};

const getMindMap = async (
  conversationId: string,
): Promise<{ data: MindMap | null }> => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/mindmap`, BASE_API_URL),
    {
      method: "get",
      credentials: "include",
    },
  );

  if (!res.ok) throw new Error("Failed to get flash cards");

  return res.json();
};

export const MindMapApi = {
  createMindMap,
  getMindMap,
};

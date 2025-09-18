import { Conversation } from "@/types/conversation.types";
import { Document } from "@/types/document.types";
import { BASE_API_URL } from ".";

const createNewConversation = async (file: File) => {
  const formData = new FormData();

  formData.append("document", file);

  const res = await fetch(new URL("/api/conversations", BASE_API_URL), {
    method: "post",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
};

const getUserConversations = async (): Promise<{
  conversations: Conversation[];
}> => {
  const res = await fetch(new URL("/api/conversations", BASE_API_URL), {
    method: "get",
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
};

const getConversation = async (
  conversationId: string
): Promise<{ conversation: Conversation; document: Document }> => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}`, BASE_API_URL),
    {
      method: "get",
      credentials: "include",
    }
  );

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
};

export const ConversationApi = {
  createNewConversation,
  getUserConversations,
  getConversation,
};

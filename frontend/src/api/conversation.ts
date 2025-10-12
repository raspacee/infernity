import { Conversation } from "@/types/conversation.types";
import { Document } from "@/types/document.types";
import { BASE_API_URL } from ".";
import { UpdateConversationFields } from "@/validators/conversation.validator";

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
  conversationId: string,
): Promise<{ conversation: Conversation; document: Document }> => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}`, BASE_API_URL),
    {
      method: "get",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
};

const updateConversation = async (
  fields: UpdateConversationFields & { id: string },
) => {
  const res = await fetch(
    new URL(`/api/conversations/${fields.id}`, BASE_API_URL),
    {
      method: "PATCH",
      body: JSON.stringify(fields),
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    },
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
  updateConversation,
};

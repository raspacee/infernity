import { Message } from "@/types/message.types";
import { BASE_API_URL } from ".";

const getMessages = async (
  conversationId: string
): Promise<{ messages: Message[] }> => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/messages`, BASE_API_URL),
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

const createMessage = async ({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<{ message: Message }> => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/messages`, BASE_API_URL),
    {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res.json();
};

export const MessageApi = {
  getMessages,
  createMessage,
};

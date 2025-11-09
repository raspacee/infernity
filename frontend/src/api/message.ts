import { Message, MessageWithAnnotations } from "@/types/message.types";
import { BASE_API_URL } from ".";

const getMessages = async (
  conversationId: string,
): Promise<{ messages: MessageWithAnnotations[] }> => {
  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/messages`, BASE_API_URL),
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

const createMessage = async ({
  conversationId,
  content,
  image,
}: {
  conversationId: string;
  content: string;
  image: Blob | null;
}): Promise<{ message: Message }> => {
  const formData = new FormData();

  formData.append("content", content);
  if (image) formData.append("image", image);

  const res = await fetch(
    new URL(`/api/conversations/${conversationId}/messages`, BASE_API_URL),
    {
      method: "post",
      credentials: "include",
      body: formData,
    },
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

import { MessageApi } from "@/api/message";
import { useQuery } from "@tanstack/react-query";

export const useGetMessages = (conversationId: string) => {
  return useQuery({
    queryFn: () => MessageApi.getMessages(conversationId),
    queryKey: ["conversations", conversationId, "messages"],
  });
};

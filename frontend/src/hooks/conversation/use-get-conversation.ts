import { ConversationApi } from "@/api/conversation";
import { useQuery } from "@tanstack/react-query";

export const useGetConversation = (conversationId: string) => {
  return useQuery({
    queryFn: () => ConversationApi.getConversation(conversationId),
    queryKey: ["conversations", conversationId],
  });
};

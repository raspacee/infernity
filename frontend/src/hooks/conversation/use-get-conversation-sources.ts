import { ConversationApi } from "@/api/conversation";
import { useQuery } from "@tanstack/react-query";

export const useGetConversationSources = (conversationId: string) => {
  return useQuery({
    queryFn: async () => {
      const res = await ConversationApi.getConversationSources(conversationId);
      return res.data;
    },
    queryKey: ["conversations", conversationId, "sources"],
  });
};

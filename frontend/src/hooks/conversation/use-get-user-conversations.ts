import { ConversationApi } from "@/api/conversation";
import { useQuery } from "@tanstack/react-query";

export const useGetUserConversations = () => {
  return useQuery({
    queryFn: ConversationApi.getUserConversations,
    queryKey: ["conversations", "me"],
  });
};

import { ConversationApi } from "@/api/conversation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ConversationApi.updateConversation,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", "me"] });
    },
  });
};

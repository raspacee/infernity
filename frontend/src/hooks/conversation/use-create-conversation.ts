import { ConversationApi } from "@/api/conversation";
import { useMutation } from "@tanstack/react-query";

export const useCreateNewConversation = () => {
  return useMutation({
    mutationFn: ConversationApi.createNewConversation,
    onError: (error) => {
      console.error(error);
    },
  });
};

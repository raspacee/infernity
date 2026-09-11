import { ConversationApi } from "@/api/conversation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ConversationApi.deleteConversation,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", "me"],
      });
      toast.success("Conversation deleted successfully");
    },
  });
};

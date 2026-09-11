import { ConversationApi } from "@/api/conversation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateNewConversation = () => {
  return useMutation({
    mutationFn: ConversationApi.createNewConversation,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      toast.success("Document created successfully");
    },
  });
};

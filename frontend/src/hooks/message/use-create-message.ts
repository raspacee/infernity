import { MessageApi } from "@/api/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: MessageApi.createMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", variables.conversationId, "messages"],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
};

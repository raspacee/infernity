import { MessageApi } from "@/api/message";
import { Message } from "@/types/message.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: MessageApi.createMessage,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["conversations", variables.conversationId, "messages"],
      });

      const previousMessages = queryClient.getQueryData([
        "conversations",
        variables.conversationId,
        "messages",
      ]);

      // Optimistically update the cache
      queryClient.setQueryData(
        ["conversations", variables.conversationId, "messages"],
        (old: { messages: Message[] }): { messages: Message[] } => {
          return {
            messages: [
              ...old.messages,
              {
                id: old.messages[old.messages.length - 1].id + 1,
                content: variables.content,
                conversationId: variables.conversationId,
                createdAt: new Date().toISOString(),
                model: "openai",
                role: "user",
              },
            ],
          };
        }
      );

      return { previousMessages };
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", variables.conversationId, "messages"],
      });
    },
    onError: (_, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["conversations", variables.conversationId, "messages"],
          context.previousMessages
        );
      }
    },
  });
};

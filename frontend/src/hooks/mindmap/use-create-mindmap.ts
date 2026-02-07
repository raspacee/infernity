import { MindMapApi } from "@/api/mindmap";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateMindMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: MindMapApi.createMindMap,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId, "mindmap"],
      });
    },
    onError: (error) => {
      console.error("Mind map creation failed:", error);
    },
  });
};

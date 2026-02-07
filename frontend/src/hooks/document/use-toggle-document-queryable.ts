import { DocumentApi } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useToggleDocumentQueryable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DocumentApi.toggleDocumentQueryable,
    onError: (error) => {
      toast.error("Toggle document queryable failed");
      console.error(error);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", variables.conversationId, "sources"],
      });
    },
  });
};

import { DocumentApi } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DocumentApi.addDocument,
    onError: (error) => {
      console.error("Add document failed:", error);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", variables.conversationId, "sources"],
      });
      toast.success("Successfully added a new source");
    },
  });
};

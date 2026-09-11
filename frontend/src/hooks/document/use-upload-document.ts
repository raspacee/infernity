import { DocumentApi } from "@/api/document";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: DocumentApi.uploadPdf,
    onError: (error) => {
      console.error("Upload failed:", error);
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully");
    },
  });
};

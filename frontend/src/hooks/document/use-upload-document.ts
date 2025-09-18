import { DocumentApi } from "@/api/document";
import { useMutation } from "@tanstack/react-query";

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: DocumentApi.uploadPdf,
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });
};

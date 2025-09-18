import { DocumentApi } from "@/api/document";
import { useQuery } from "@tanstack/react-query";

export const useGetPresignedUrl = (
  documentId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryFn: () => DocumentApi.getPresignedUrl(documentId),
    queryKey: ["document", documentId],
    refetchOnWindowFocus: false,
    enabled: options?.enabled,
  });
};

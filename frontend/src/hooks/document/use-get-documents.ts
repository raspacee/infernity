import { DocumentApi } from "@/api/document";
import { useQuery } from "@tanstack/react-query";

export const useGetDocuments = (
  conversationId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryFn: () => DocumentApi.getDocuments(conversationId),
    queryKey: ["document", conversationId, "presigned-urls"],
    refetchOnWindowFocus: false,
    enabled: options?.enabled,
  });
};

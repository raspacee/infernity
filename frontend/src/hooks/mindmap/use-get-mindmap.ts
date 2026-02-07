import { MindMapApi } from "@/api/mindmap";
import { useQuery } from "@tanstack/react-query";

export const useGetMindMap = (conversationId: string) => {
  return useQuery({
    queryFn: async () => {
      const res = await MindMapApi.getMindMap(conversationId);
      return res.data;
    },
    queryKey: ["conversations", conversationId, "mindmap"],
  });
};

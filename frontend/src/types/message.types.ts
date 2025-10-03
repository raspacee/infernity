export type Message = {
  id: number;
  role: "user" | "assistant";
  model: string | null;
  queryImageURL: string | null;
  content: string;
  conversationId: string;
  createdAt: string;
};

export type Message = {
  id: number;
  role: "user" | "assistant";
  model: string | null;
  queryImageURL: string | null;
  content: string;
  conversationId: string;
  createdAt: string;
};

export type MessageWithAnnotations = Message & {
  annotations: {
    chunkId: string;
    annotations: ChunkBoxPosition[];
  }[];
};

export type ChunkBoxPosition = {
  id: string;
  chunkId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  pageNo: number;
  documentId: string;
};

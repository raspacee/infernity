import { Pinecone } from "@pinecone-database/pinecone";

export const pc = new Pinecone({ apiKey: process.env.PINECONE_KEY! });

export const documentsIndex = pc.index(
  "documents-index",
  process.env.PINECONE_INDEX_HOST
);

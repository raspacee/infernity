import { FeatureExtractionPipeline, pipeline } from "@xenova/transformers";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Chunk } from "./chunks";

let extractor: FeatureExtractionPipeline;

async function initializeExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-mpnet-base-v2"
    );
  }
}

export type EmbeddingWithText = {
  values: number[];
  chunk: Chunk;
};

export async function getEmbeddings(
  chunks: Chunk[]
): Promise<EmbeddingWithText[]> {
  await initializeExtractor();

  const embeddings: EmbeddingWithText[] = [];

  for (const chunk of chunks) {
    const output = await extractor(chunk.text, {
      pooling: "mean",
      normalize: true,
    });
    embeddings.push({
      values: Array.from(output.data),
      chunk,
    });
  }

  return embeddings;
}

export const openaiembeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

export async function createEmbeddings(
  chunks: Chunk[]
): Promise<EmbeddingWithText[]> {
  const texts = chunks.map((chunk) => chunk.text);
  const embeddings = await openaiembeddings.embedDocuments(texts);
  return embeddings.map(
    (embedding, index) =>
      ({
        values: embedding,
        chunk: chunks[index],
      } as EmbeddingWithText)
  );
}

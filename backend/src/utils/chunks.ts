import { getEncoding } from "js-tiktoken";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

export function chunkTextByTokens(
  text: string,
  chunkSize = 500,
  overlap = 50
): string[] {
  const encoding = getEncoding("cl100k_base");

  // Split text into sentences first
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];

  let currentChunk = "";
  let currentTokens = 0;
  let i = 0;

  while (i < sentences.length) {
    const sentence = sentences[i];
    const sentenceTokens = encoding.encode(sentence).length;

    // If adding this sentence would exceed chunk size
    if (currentTokens + sentenceTokens > chunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(currentChunk.trim());

      // Create overlap by going back and including previous sentences
      if (overlap > 0 && chunks.length > 0) {
        const overlapText = createOverlap(sentences, i, overlap, encoding);
        currentChunk = overlapText;
        currentTokens = encoding.encode(overlapText).length;
      } else {
        currentChunk = "";
        currentTokens = 0;
      }

      // Don't increment i, so we'll try to add this sentence again
      continue;
    }

    // Add sentence to current chunk
    if (currentChunk.length > 0) {
      currentChunk += " " + sentence;
    } else {
      currentChunk = sentence;
    }
    currentTokens += sentenceTokens;
    i++;
  }

  // Add final chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function createOverlap(
  sentences: string[],
  currentIndex: number,
  overlapTokens: number,
  encoding: any
): string {
  let overlapText = "";
  let tokens = 0;

  // Go backwards from current position to create overlap
  for (let j = currentIndex - 1; j >= 0 && tokens < overlapTokens; j--) {
    const sentence = sentences[j];
    const sentenceTokens = encoding.encode(sentence).length;

    if (tokens + sentenceTokens <= overlapTokens) {
      overlapText = sentence + (overlapText ? " " + overlapText : "");
      tokens += sentenceTokens;
    } else {
      break;
    }
  }

  return overlapText;
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkOverlap: 50,
  chunkSize: 500,
  separators: ["\n\n", "\n", " ", ""],
});

export async function chunkDocument(
  text: string,
  metadata?: Record<string, any>
) {
  const doc = new Document({ pageContent: text, metadata });
  const chunks = await textSplitter.splitDocuments([doc]);
  return chunks;
}

export interface Chunk {
  text: string;
  startPage: number | null;
  endPage: number | null;
  pages: number[];
  chunkIndex: number;
}

export function createChunksWithPageMerging(
  pages: string[],
  minChunkSize: number = 500,
  maxChunkSize: number = 2000,
  overlap: number = 100
): Chunk[] {
  const chunks: Chunk[] = [];
  let chunkIndex = 0;
  let currentChunk: Chunk = {
    text: "",
    startPage: null,
    endPage: null,
    pages: [],
    chunkIndex: chunkIndex++,
  };

  pages.forEach((pageText, index) => {
    const pageNum: number = index + 1;

    // If this is the first page in chunk
    if (currentChunk.startPage === null) {
      currentChunk.startPage = pageNum;
    }

    currentChunk.text += currentChunk.text ? `\n${pageText}` : pageText;
    currentChunk.pages.push(pageNum);
    currentChunk.endPage = pageNum;

    // Check if we should finalize this chunk
    const shouldFinalize: boolean =
      currentChunk.text.length >= minChunkSize || // Hit minimum size
      pageNum === pages.length || // Last page
      currentChunk.text.length >= maxChunkSize; // Hit maximum size

    if (shouldFinalize) {
      chunks.push(currentChunk);

      // Prepare overlap for the next chunk
      const overlapText: string =
        currentChunk.text.length > overlap
          ? currentChunk.text.slice(-overlap)
          : currentChunk.text;

      // Start new chunk with overlap text
      currentChunk = {
        text: overlapText,
        startPage: pageNum === pages.length ? null : pageNum,
        endPage: null,
        pages: pageNum < pages.length ? [pageNum] : [],
        chunkIndex: chunkIndex++,
      };
    }
  });

  return chunks;
}

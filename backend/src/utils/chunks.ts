import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

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

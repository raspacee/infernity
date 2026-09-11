import { Box, Chunk, PageData } from "./pdf-parser";

export function createOverlappingChunks(
  documentId: string,
  pages: PageData[],
  chunkSize = 800,
  overlap = 100,
): Chunk[] {
  const chunks: Chunk[] = [];

  for (const page of pages) {
    let buffer = "";
    let boxes: Box[] = [];

    for (let i = 0; i < page.items.length; i++) {
      const item = page.items[i];
      buffer += item.text + " ";
      boxes.push({
        x1: item.x1,
        y1: item.y1,
        x2: item.x2,
        y2: item.y2,
        width: item.width,
        height: item.height,
        documentId,
      });

      const isLast = i === page.items.length - 1;

      if (buffer.length >= chunkSize || isLast) {
        console.log("pageNumber", page.pageNumber);
        chunks.push({
          pageNumber: page.pageNumber,
          text: buffer.trim(),
          boxes: [...boxes],
        });

        const overlapText = buffer.slice(-overlap);
        buffer = overlapText;
        boxes = [];
      }
    }
  }

  return chunks;
}

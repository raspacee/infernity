import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ParsedPdf {
  pages: ExtractedPage[];
  totalPages: number;
  fullText: string;
}

export const parsePdf = async (buffer: Buffer): Promise<ParsedPdf> => {
  try {
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      // standardFontDataUrl: "", // Disable font loading for server
      // cMapUrl: "", // Disable cMap loading for server
    });

    const pdf = await loadingTask.promise;
    const pages: ExtractedPage[] = [];
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const pageContent = await page.getTextContent();

      const items = pageContent.items.map((item: any) => ({
        str: item.str,
        transform: item.transform,
        width: item.width,
        height: item.height,
      }));

      const pageText = reconstructPageText(items);

      pages.push({
        pageNumber: pageNum,
        text: pageText,
      });

      fullText += pageText + "\n\n";
    }

    return {
      pages,
      totalPages: pdf.numPages,
      fullText: fullText.trim(),
    };
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to extract text: ${err}`);
  }
};

const reconstructPageText = (items: any[]): string => {
  if (items.length === 0) return "";

  // Sort items by position (top to bottom, left to right)
  const sortedItems = items
    .filter((item) => item.str.trim().length > 0)
    .sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5]; // Y position (top to bottom)
      if (Math.abs(yDiff) > 5) return yDiff; // Different lines
      return a.transform[4] - b.transform[4]; // Same line, sort by X position
    });

  let text = "";
  let lastY = null;

  for (const item of sortedItems) {
    const currentY = item.transform[5];

    // Add line break if we're on a new line
    if (lastY !== null && Math.abs(currentY - lastY) > 5) {
      text += "\n";
    }

    // Add space if needed (simple heuristic)
    if (text.length > 0 && !text.endsWith(" ") && !text.endsWith("\n")) {
      text += " ";
    }

    text += item.str;
    lastY = currentY;
  }

  return text;
};

// Clean extracted text
const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Multiple line breaks to double
    .replace(/[^\S\n]+/g, " ") // Clean up whitespace but preserve line breaks
    .trim();
};

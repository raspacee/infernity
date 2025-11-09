import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export interface TextItem extends Box {
  text: string;
}

export interface PageData {
  pageNumber: number;
  items: TextItem[];
  pageContent: string;
}

export interface Chunk {
  pageNumber: number;
  text: string;
  boxes: Box[];
}

export interface ParsedPDF {
  totalPages: number;
  pages: PageData[];
  fullContent: string;
}

export async function extractTextWithPositions(fileBuffer: Buffer) {
  try {
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(fileBuffer),
    }).promise;
    const pages: PageData[] = [];

    let fullContent = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      let pageContent = "";

      const items: TextItem[] = content.items.map((item: any) => {
        pageContent += item.str;

        const x1 = item.transform[4];
        const y1 = item.transform[5];
        const width = item.width;
        const height = item.height;
        const x2 = x1 + width;
        const y2 = y1 + height;

        return {
          text: item.str,
          x1,
          y1,
          x2,
          y2,
          width,
          height,
        };
      });

      pages.push({ pageNumber: i, items, pageContent });
      fullContent += pageContent;
    }

    return {
      fullContent,
      pages,
      totalPages: pdf.numPages,
    };
  } catch (err) {
    console.error(err);
  }
}

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { db } from "../db";
import {
  chunkBoxPositionTable,
  documentChunksTable,
  documentsTable,
} from "../db/schema";
import { ParsedPdf, parsePdf } from "../utils/pdf";
// import { Chunk, createChunksWithPageMerging } from "../utils/chunks";
import {
  createEmbeddings,
  EmbeddingWithChunk,
  openaiembeddings,
} from "../utils/embeddings";
import {
  Index,
  RecordMetadata,
  type PineconeRecord,
} from "@pinecone-database/pinecone";
import { eq, inArray } from "drizzle-orm";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storeFileInS3 } from "../clients/s3-client";
import {
  Chunk,
  extractTextWithPositions,
  ParsedPDF,
} from "../utils/pdf-parser";
import { createOverlappingChunks } from "../utils/chunker";

interface UploadDocumentParams {
  file: Express.Multer.File;
  userId: string;
  conversationId: string;
}

interface DocumentProcessingResult {
  documentId: string;
  parsedPdf: ParsedPDF;
}

export class DocumentService {
  constructor(
    private s3Client: S3Client,
    private documentsIndex: Index<RecordMetadata>
  ) {}

  /**
   *
   */
  async uploadDocument({
    file,
    userId,
    conversationId,
  }: UploadDocumentParams): Promise<DocumentProcessingResult> {
    const documentId = uuid();

    const [, parsedPdf] = await Promise.all([
      storeFileInS3(file, {
        documentId,
        userId,
        conversationId,
      }),
      // parsePdf(file.buffer),
      extractTextWithPositions(file.buffer),
    ]);

    if (!parsedPdf) throw new Error("Error while parsing pdf.");

    const s3Key = `pdf/${documentId}`;

    await this.createDocument({
      id: documentId,
      conversationId,
      userId,
      filename: file.originalname,
      originalFilename: file.originalname,
      fileSize: file.size,
      mimetype: file.mimetype,
      bucketName: process.env.MINIO_BUCKET_NAME!,
      s3Key,
      s3Url: s3Key,
      textContent: parsedPdf.fullContent,
      pageCount: parsedPdf.totalPages!,
      uploadedAt: new Date().toISOString(),
      processingStatus: "processing",
    });

    // const chunks = createChunksWithPageMerging(
    //   parsedPdf.pages.map((page) => page.text)
    // );
    const chunks = createOverlappingChunks(parsedPdf.pages);

    await this.storeEmbeddingsAndChunks(
      documentId,
      userId,
      chunks,
      conversationId
    );

    await db
      .update(documentsTable)
      .set({ processingStatus: "completed" })
      .where(eq(documentsTable.id, documentId));

    return { documentId, parsedPdf };
  }

  /**
   * Store the metadata related to the document in the primary database (PostgreSQL)
   *
   * @param file
   * @param documentId
   * @param userId
   * @param parsed
   */
  private async createDocument(
    newDocument: typeof documentsTable.$inferInsert
  ) {
    await db.insert(documentsTable).values({
      ...newDocument,
    });
  }

  /**
   * This function creates embeddings from document chunks,
   * and stores both embeddings and chunks in their respective databases
   *
   * @param documentId
   * @param userId
   * @param chunks
   */
  private async storeEmbeddingsAndChunks(
    documentId: string,
    userId: string,
    chunks: Chunk[],
    conversationId: string
  ) {
    const embeddings = await createEmbeddings(chunks);

    const pineconeRecords = await this.storePineconeEmbeddings(
      embeddings,
      conversationId,
      userId
    );

    await this.storeDocumentChunks(
      embeddings,
      pineconeRecords,
      documentId,
      userId
    );
  }

  private async storePineconeEmbeddings(
    embeddings: EmbeddingWithChunk[],
    conversationId: string,
    userId: string
  ) {
    const pineconeRecords: PineconeRecord[] = embeddings.map((embedding) => ({
      id: uuid(),
      values: embedding.values,
      metadata: {
        userId,
        conversationId,
      },
    }));

    await this.documentsIndex.namespace(userId).upsert(pineconeRecords);
    return pineconeRecords;
  }

  private async storeDocumentChunks(
    embeddings: EmbeddingWithChunk[],
    pineconeRecords: PineconeRecord[],
    documentId: string,
    userId: string
  ) {
    const boxesToBeInserted: (typeof chunkBoxPositionTable.$inferInsert)[] = [];

    const documentChunksToBeInserted: (typeof documentChunksTable.$inferInsert)[] =
      pineconeRecords.map((embedding, index) => {
        const chunkId = uuid();

        for (const box of embeddings[index].chunk.boxes) {
          boxesToBeInserted.push({
            chunkId,
            ...box,
          });
        }

        return {
          id: chunkId,
          userId,
          documentId,
          pineconeId: embedding.id,
          chunkText: embeddings[index].chunk.text,
          embeddingModel: "text-embedding-3-small",
          createdAt: new Date().toISOString(),
          pageNumber: embeddings[index].chunk.pageNumber,
        };
      });

    await Promise.all([
      await db.insert(documentChunksTable).values(documentChunksToBeInserted),
      await db.insert(chunkBoxPositionTable).values(boxesToBeInserted),
    ]);
  }

  public getDocumentById = async (
    documentId: string
  ): Promise<typeof documentsTable.$inferSelect | null> => {
    const [document] = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.id, documentId));

    if (!document) return null;

    return document;
  };

  public getPresignedUrl = async (
    documentKey: string,
    bucketName: string
  ): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: documentKey,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 60,
    });

    return presignedUrl;
  };

  /**
   * Get the nearest document chunks to a user query
   * by comparing their embeddings
   * @param conversationId
   * @param userId
   * @param content - The user's query
   * @returns
   */
  public async getNearestChunks(
    conversationId: string,
    userId: string,
    query: string
  ) {
    const vector = await openaiembeddings.embedQuery(query);

    const response = await this.documentsIndex.namespace(userId).searchRecords({
      query: {
        topK: 5,
        vector: {
          values: vector,
        },
        filter: {
          conversationId,
        },
      },
    });

    const pineconesIds = response.result.hits.map((hit) => hit._id);

    const chunksWithBox = await db
      .select()
      .from(documentChunksTable)
      .leftJoin(
        chunkBoxPositionTable,
        eq(chunkBoxPositionTable.chunkId, documentChunksTable.id)
      )
      .where(inArray(documentChunksTable.pineconeId, pineconesIds));

    const grouped = Object.values(
      chunksWithBox.reduce((acc, { documentChunks, chunkBoxPosition }) => {
        acc[documentChunks.id] ??= { ...documentChunks, boxPositions: [] };
        if (chunkBoxPosition)
          acc[documentChunks.id].boxPositions.push(chunkBoxPosition);
        return acc;
      }, {} as Record<string, typeof documentChunksTable.$inferSelect & { boxPositions: (typeof chunkBoxPositionTable.$inferSelect)[] }>)
    );
    return grouped;
  }
}

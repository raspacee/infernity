import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { db } from "../db";
import { documentChunksTable, documentsTable } from "../db/schema";
import { parsePdf } from "../utils/pdf";
import { Chunk, createChunksWithPageMerging } from "../utils/chunks";
import {
  createEmbeddings,
  EmbeddingWithText,
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

interface UploadDocumentParams {
  file: Express.Multer.File;
  userId: string;
  conversationId: string;
}

interface DocumentProcessingResult {
  documentId: string;
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
      parsePdf(file.buffer),
    ]);

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
      textContent: parsedPdf.fullText,
      pageCount: parsedPdf.totalPages,
      uploadedAt: new Date().toISOString(),
      processingStatus: "processing",
    });

    const chunks = createChunksWithPageMerging(
      parsedPdf.pages.map((page) => page.text)
    );

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

    return { documentId };
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

    const pineconeEmbeddings = await this.storePineconeEmbeddings(
      embeddings,
      conversationId,
      userId
    );

    await this.createDocumentChunks(
      embeddings,
      pineconeEmbeddings,
      documentId,
      userId
    );
  }

  private async storePineconeEmbeddings(
    embeddings: EmbeddingWithText[],
    conversationId: string,
    userId: string
  ) {
    const pineconeEmbeddings: PineconeRecord[] = embeddings.map(
      (embedding) => ({
        id: uuid(),
        values: embedding.values,
        metadata: {
          userId,
          conversationId,
        },
      })
    );

    await this.documentsIndex.namespace(userId).upsert(pineconeEmbeddings);
    return pineconeEmbeddings;
  }

  private async createDocumentChunks(
    embeddings: EmbeddingWithText[],
    pineconeEmbeddings: PineconeRecord[],
    documentId: string,
    userId: string
  ) {
    const documentChunksToBeInserted: (typeof documentChunksTable.$inferInsert)[] =
      pineconeEmbeddings.map((embedding, index) => ({
        id: uuid(),
        userId,
        documentId,
        pineconeId: embedding.id,
        chunkIndex: embeddings[index].chunk.chunkIndex,
        chunkText: embeddings[index].chunk.text,
        embeddingModel: "text-embedding-3-small",
        startPage: embeddings[index].chunk.startPage!,
        endPage: embeddings[index].chunk.endPage!,
        createdAt: new Date().toISOString(),
      }));

    await db.insert(documentChunksTable).values(documentChunksToBeInserted);
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
  ): Promise<(typeof documentChunksTable.$inferSelect)[]> {
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

    const chunks = await db
      .select()
      .from(documentChunksTable)
      .where(inArray(documentChunksTable.pineconeId, pineconesIds));

    return chunks;
  }
}

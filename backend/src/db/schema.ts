import { sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  varchar,
  uuid,
  timestamp,
  pgEnum,
  bigint,
  text,
  index,
  unique,
  bigserial,
} from "drizzle-orm/pg-core";

export const providerTypeEnum = pgEnum("provider", ["google", "facebook"]);

export const messagesRoleEnum = pgEnum("messagesRole", ["user", "assistant"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  provider: providerTypeEnum().notNull(),
  providerId: varchar({ length: 255 }).notNull(),
  avatarUrl: varchar({ length: 512 }),
  createdAt: timestamp({
    withTimezone: true,
    mode: "string",
  }).notNull(),
});

export const processingStatusEnum = pgEnum("processingStatus", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const documentsTable = pgTable(
  "documents",
  {
    id: uuid().primaryKey(),
    userId: uuid()
      .references(() => usersTable.id)
      .notNull(),
    conversationId: uuid()
      .references(() => conversationsTable.id)
      .notNull(),
    textContent: text().notNull(),
    processingStatus: processingStatusEnum().default("pending").notNull(),

    /* Metadata */
    filename: varchar({ length: 255 }).notNull(),
    originalFilename: varchar({ length: 255 }).notNull(),
    fileSize: bigint({
      mode: "number",
    }).notNull(),
    mimetype: varchar({ length: 50 }).notNull(),
    pageCount: integer().notNull(),

    /* S3 info */
    bucketName: varchar({ length: 50 }).notNull(),
    s3Key: varchar({ length: 512 }).notNull(),
    s3Url: varchar({ length: 1000 }).notNull(),

    uploadedAt: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [index("userIdIndex").on(table.userId)]
);

export const documentChunksTable = pgTable(
  "documentChunks",
  {
    id: uuid().primaryKey(),
    documentId: uuid()
      .references(() => documentsTable.id)
      .notNull(),
    userId: uuid()
      .references(() => usersTable.id)
      .notNull(),

    chunkText: text().notNull(),
    chunkIndex: integer().notNull(),
    startPage: integer().notNull(),
    endPage: integer().notNull(),

    pineconeId: varchar({ length: 255 }).notNull(),
    embeddingModel: varchar({ length: 100 }).notNull(),

    createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    index("chunkDocumentIdIndex").on(table.documentId),
    index("chunkPineconeIdIndex").on(table.pineconeId),
    index("chunkTextSearchIndex").using(
      "gin",
      sql`to_tsvector('english', ${table.chunkText})`
    ),
    unique("documentChunkUnique").on(table.documentId, table.chunkIndex),
  ]
);

export const conversationsTable = pgTable("conversations", {
  id: uuid().primaryKey(),
  title: varchar({ length: 500 }).notNull(),

  userId: uuid()
    .references(() => usersTable.id)
    .notNull(),

  createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
});

export const messagesTable = pgTable(
  "messages",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    role: messagesRoleEnum().notNull(),
    model: varchar({ length: 100 }),
    content: text().notNull(),

    queryImageKey: text(),

    conversationId: uuid()
      .references(() => conversationsTable.id, { onDelete: "cascade" })
      .notNull(),

    createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    index("conversationIdIndex").on(table.conversationId),
    index("conversationIdOrderIndex").on(table.conversationId, table.id),
  ]
);

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
  real,
  boolean,
} from "drizzle-orm/pg-core";

export const providerTypeEnum = pgEnum("provider", ["google", "facebook"]);

export const messagesRoleEnum = pgEnum("messagesRole", ["user", "assistant"]);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  provider: providerTypeEnum(),
  providerId: varchar({ length: 255 }),
  avatarUrl: varchar({ length: 512 }),
  createdAt: timestamp({
    withTimezone: true,
    mode: "string",
  }).notNull(),
  isTraditionalAccount: boolean().notNull(),
  isVerified: boolean().notNull(),
  password: varchar({ length: 255 }),
});

export const signupVerificationTable = pgTable("signupVerificationTable", {
  id: varchar({ length: 255 }).primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: varchar().notNull(),
  expiresAt: timestamp({
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
    pageNumber: integer().notNull(),

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
  ]
);

export const chunkBoxPositionTable = pgTable(
  "chunkBoxPosition",
  {
    id: uuid().defaultRandom().primaryKey(),
    chunkId: uuid().references(() => documentChunksTable.id),
    x1: real().notNull(),
    y1: real().notNull(),
    x2: real().notNull(),
    y2: real().notNull(),
    width: real().notNull(),
    height: real().notNull(),
    pageNo: integer(),
  },
  (table) => [index("chunkPositionChunkIdIndex").on(table.chunkId)]
);

export const chunkBoxPositionToMessageMappingTable = pgTable(
  "chunkBoxPositionToMessageMapping",
  {
    chunkBoxPositionId: uuid()
      .references(() => chunkBoxPositionTable.id)
      .notNull(),
    messageId: bigserial({ mode: "number" })
      .references(() => messagesTable.id)
      .notNull(),
  },
  (table) => [unique().on(table.chunkBoxPositionId, table.messageId)]
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

export const flashCardsTable = pgTable("flashcards", {
  id: bigserial({ mode: "number" }).primaryKey(),

  groupingId: uuid()
    .references(() => flashCardsGroupTable.id, {
      onDelete: "cascade",
    })
    .notNull(),

  frontContent: text(),
  backContent: text(),
});

export const flashCardsGroupTable = pgTable("flashcards_group", {
  id: uuid().primaryKey(),

  title: varchar({ length: 512 }).notNull(),

  conversationId: uuid()
    .references(() => conversationsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),

  createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
});

export const mindMapTable = pgTable("mind_map", {
  id: bigserial({ mode: "number" }).primaryKey(),

  conversationId: uuid()
    .references(() => conversationsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),

  chartCode: text().notNull(),

  createdAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
});

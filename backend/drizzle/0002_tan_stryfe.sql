CREATE TABLE "documentChunks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"documentId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"chunkText" text NOT NULL,
	"chunkIndex" integer NOT NULL,
	"startPage" integer NOT NULL,
	"endPage" integer NOT NULL,
	"pineconeId" varchar(255) NOT NULL,
	"embeddingModel" varchar(100) NOT NULL,
	"createdAt" timestamp with time zone,
	CONSTRAINT "documentChunkUnique" UNIQUE("documentId","chunkIndex")
);
--> statement-breakpoint
ALTER TABLE "documentChunks" ADD CONSTRAINT "documentChunks_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentChunks" ADD CONSTRAINT "documentChunks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chunkDocumentIdIndex" ON "documentChunks" USING btree ("documentId");--> statement-breakpoint
CREATE INDEX "chunkPineconeIdIndex" ON "documentChunks" USING btree ("pineconeId");--> statement-breakpoint
CREATE INDEX "chunkTextSearchIndex" ON "documentChunks" USING gin (to_tsvector('english', "chunkText"));
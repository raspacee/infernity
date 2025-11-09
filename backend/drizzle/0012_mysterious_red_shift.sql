ALTER TABLE "documentChunks" ALTER COLUMN "pageNumber" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "documentChunks" ALTER COLUMN "pageNumber" DROP NOT NULL;
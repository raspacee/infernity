ALTER TABLE "documentChunks" ALTER COLUMN "pageNumber" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "documentChunks" ALTER COLUMN "pageNumber" SET NOT NULL;
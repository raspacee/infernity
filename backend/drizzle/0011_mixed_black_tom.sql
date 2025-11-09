CREATE TABLE "chunkBoxPosition" (
	"chunkId" uuid,
	"x1" integer NOT NULL,
	"y1" integer NOT NULL,
	"x2" integer NOT NULL,
	"y2" integer NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documentChunks" DROP CONSTRAINT "documentChunkUnique";--> statement-breakpoint
ALTER TABLE "documentChunks" ADD COLUMN "pageNumber" integer default 1;--> statement-breakpoint
ALTER TABLE "chunkBoxPosition" ADD CONSTRAINT "chunkBoxPosition_chunkId_documentChunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."documentChunks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chunkPositionChunkIdIndex" ON "chunkBoxPosition" USING btree ("chunkId");--> statement-breakpoint
ALTER TABLE "documentChunks" DROP COLUMN "chunkIndex";--> statement-breakpoint
ALTER TABLE "documentChunks" DROP COLUMN "startPage";--> statement-breakpoint
ALTER TABLE "documentChunks" DROP COLUMN "endPage";
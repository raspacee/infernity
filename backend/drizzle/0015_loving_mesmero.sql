CREATE TABLE "chunkBoxPositionToMessageMapping" (
	"chunkBoxPositionId" uuid,
	"messageId" bigserial NOT NULL,
	CONSTRAINT "chunkBoxPositionToMessageMapping_chunkBoxPositionId_messageId_unique" UNIQUE("chunkBoxPositionId","messageId")
);
--> statement-breakpoint
ALTER TABLE "chunkBoxPosition" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "chunkBoxPositionToMessageMapping" ADD CONSTRAINT "chunkBoxPositionToMessageMapping_chunkBoxPositionId_chunkBoxPosition_id_fk" FOREIGN KEY ("chunkBoxPositionId") REFERENCES "public"."chunkBoxPosition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunkBoxPositionToMessageMapping" ADD CONSTRAINT "chunkBoxPositionToMessageMapping_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;
CREATE TABLE "messageAnnotation" (
	"chunkId" uuid NOT NULL,
	"messageId" bigserial NOT NULL,
	CONSTRAINT "messageAnnotation_chunkId_messageId_unique" UNIQUE("chunkId","messageId")
);
--> statement-breakpoint
ALTER TABLE "messageAnnotation" ADD CONSTRAINT "messageAnnotation_chunkId_documentChunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."documentChunks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messageAnnotation" ADD CONSTRAINT "messageAnnotation_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;
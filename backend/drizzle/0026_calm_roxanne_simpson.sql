ALTER TABLE "chunkBoxPosition" DROP CONSTRAINT "chunkBoxPosition_chunkId_documentChunks_id_fk";
--> statement-breakpoint
ALTER TABLE "chunkBoxPosition" DROP CONSTRAINT "chunkBoxPosition_documentId_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "chunkBoxPositionToMessageMapping" DROP CONSTRAINT "chunkBoxPositionToMessageMapping_chunkBoxPositionId_chunkBoxPosition_id_fk";
--> statement-breakpoint
ALTER TABLE "chunkBoxPositionToMessageMapping" DROP CONSTRAINT "chunkBoxPositionToMessageMapping_messageId_messages_id_fk";
--> statement-breakpoint
ALTER TABLE "documentChunks" DROP CONSTRAINT "documentChunks_documentId_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_conversationId_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "chunkBoxPosition" ADD CONSTRAINT "chunkBoxPosition_chunkId_documentChunks_id_fk" FOREIGN KEY ("chunkId") REFERENCES "public"."documentChunks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunkBoxPosition" ADD CONSTRAINT "chunkBoxPosition_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunkBoxPositionToMessageMapping" ADD CONSTRAINT "chunkBoxPositionToMessageMapping_chunkBoxPositionId_chunkBoxPosition_id_fk" FOREIGN KEY ("chunkBoxPositionId") REFERENCES "public"."chunkBoxPosition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunkBoxPositionToMessageMapping" ADD CONSTRAINT "chunkBoxPositionToMessageMapping_messageId_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentChunks" ADD CONSTRAINT "documentChunks_documentId_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
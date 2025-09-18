ALTER TABLE "conversations" DROP CONSTRAINT "conversations_documentId_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "conversationId" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" DROP COLUMN "documentId";
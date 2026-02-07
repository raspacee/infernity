CREATE TABLE "mind_map" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"conversationId" uuid NOT NULL,
	"chartCode" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flashcards_group" ALTER COLUMN "conversationId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mind_map" ADD CONSTRAINT "mind_map_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
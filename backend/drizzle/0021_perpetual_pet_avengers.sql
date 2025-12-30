CREATE TABLE "flashcards_group" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"conversationId" uuid,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"groupingId" uuid NOT NULL,
	"frontContent" text,
	"backContent" text
);
--> statement-breakpoint
ALTER TABLE "flashcards_group" ADD CONSTRAINT "flashcards_group_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_groupingId_flashcards_group_id_fk" FOREIGN KEY ("groupingId") REFERENCES "public"."flashcards_group"("id") ON DELETE cascade ON UPDATE no action;
CREATE TYPE "public"."processingStatus" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('google', 'facebook');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"textContent" text NOT NULL,
	"processingStatus" "processingStatus" DEFAULT 'pending' NOT NULL,
	"filename" varchar(255) NOT NULL,
	"originalFilename" varchar(255) NOT NULL,
	"fileSize" bigint NOT NULL,
	"mimetype" varchar(50) NOT NULL,
	"pageCount" integer,
	"bucketName" varchar(50) NOT NULL,
	"s3Key" varchar(512) NOT NULL,
	"s3Url" varchar(1000) NOT NULL,
	"uploadedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "provider" SET DATA TYPE "public"."provider" USING "provider"::"public"."provider";--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "userIdIndex" ON "documents" USING btree ("userId");
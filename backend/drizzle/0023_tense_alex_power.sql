CREATE TABLE "signupVerificationTable" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"email" varchar NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "provider" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "providerId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isTraditionalAccount" boolean NOT NULL default false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isVerified" boolean NOT NULL default true;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "signupVerificationTable" ADD CONSTRAINT "signupVerificationTable_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
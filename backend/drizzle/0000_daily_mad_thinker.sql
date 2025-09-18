CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"providerId" varchar(255) NOT NULL,
	"avatarUrl" varchar(512),
	"createdAt" timestamp with time zone NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

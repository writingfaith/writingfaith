CREATE TABLE "essay_notification" (
	"slug" text PRIMARY KEY NOT NULL,
	"notifiedAt" timestamp DEFAULT now() NOT NULL
);

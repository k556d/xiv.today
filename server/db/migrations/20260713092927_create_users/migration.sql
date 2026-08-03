CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"username" text CONSTRAINT "users_username_unique" UNIQUE,
	"password_hash" text,
	"email" text CONSTRAINT "users_email_unique" UNIQUE
);

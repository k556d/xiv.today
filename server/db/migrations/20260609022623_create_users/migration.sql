CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"username" text,
	"password_hash" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
	CONSTRAINT "users_username_unique" UNIQUE("username"),
);
